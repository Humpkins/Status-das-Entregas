const { pool } = require('mssql/msnodesqlv8');
const sql = require('mssql/msnodesqlv8');
const crypto = require('crypto');
const _ = require('lodash');
const connection = require('../database/connection');
const status_func = require('./status');
const coments_func = require('./comentarios');
const stats = require('../database/status/carregamento');
require('dotenv/config');

const evento_pos_pesagem_1 = process.env.CARR_EVENTO_POS_PESAGEM_1;
const evento_pos_pesagem_2 = process.env.CARR_EVENTO_POS_PESAGEM_2;
const evento_chegada = process.env.CARR_EVENTO_CHEGADA_UNIDADE;
const evento_saida = process.env.CARR_EVENTO_SAIDA_UNIDADE;

const SQL_conf = {
    driver: "msnodesqlv8",

    // Rodar em QA
    // server: "GTURST01",
    // database: "DBARM003",
    // options:{
    //     trustedConnection: true
    // },

    // Rodar em Produção
    server: process.env.SERVER_ARMA,
    database: process.env.DATABASE_ARMA,
    user: process.env.USER_ARMA,
    password: process.env.PASSWORD_ARMA,

    requestTimeout : 60000
};

module.exports = {

    // Função para retornar a hora atual no formato YYYYMMDDHHMMSS Integer
    agora(){
        const data = new Date;

        const mes = (data.getMonth()+1).toString().padStart(2, '0');
        const dia = data.getDate().toString().padStart(2, '0');
        const ano = data.getFullYear();
        const hora = data.getHours().toString().padStart(2, '0');
        const minuto = data.getMinutes().toString().padStart(2, '0');
        const segundo = data.getSeconds().toString().padStart(2, '0');
        
        const agora = parseInt(ano + mes + dia + hora + minuto + segundo)
        
        return agora;
    },

    async controleStatus( request, response ){

        const { Status, ID } = request.body;

        const indice_status = stats.status.indexOf( Status );

        const [ caminhao ] = await connection('fCarregamento')
                                    .select('*')
                                    .where('ID', '=', ID);                      

        if ( indice_status > stats.status.indexOf( evento_pos_pesagem_1 ) && indice_status <= stats.status.indexOf( evento_pos_pesagem_2 ) ) {

            if ( caminhao ) {
                if ( !caminhao.Peso_chegada ) {
                    return response.status(403).json({ err: `O caminhao não possui o peso de entrada. Atualize o caminhao para o status ${evento_pos_pesagem_1} e insira o valor do peso antes de prosseguir para outro status` });
                } else {
                    return response.status(200).json({ mensage: 'Mudança de status autorizada' });
                }
            } else {
                return response.status(200).json({ mensage: 'Mudança de status autorizada' });
            };

        } else if ( indice_status > stats.status.indexOf( evento_pos_pesagem_2 ) ) {

            if ( caminhao ) {
                if ( !caminhao.Peso_saida ) {
                    return response.status(403).json({ err: `O caminhão não possui o peso de saída. Atualize o caminhão para o status ${evento_pos_pesagem_2} e insira o valor do peso antes de prosseguir para outro status` });
                } else {
                    return response.status(200).json({ mensage: 'Mudança de status autorizada' });
                }
            } else {
                return response.status(200).json({ mensage: 'Mudança de status autorizada' });
            };

        } else {
            return response.status(200).json({ mensage: 'Mudança de status autorizada' });
        };

    },

    // Função para verificar se o caminhão ja possui os pesos necessários para atingir certos status
    async Mid_controleStatus( request, response, next ) {
        
        const { Status, ID } = request.body;

        const indice_status = stats.status.indexOf( Status );

        const [ caminhao ] = await connection('fCarregamento')
                                    .select('*')
                                    .where('ID', '=', ID);

        if ( indice_status > stats.status.indexOf( evento_pos_pesagem_1 ) && indice_status <= stats.status.indexOf( evento_pos_pesagem_2 ) ) {

            if ( caminhao ) {
                if ( !caminhao.Peso_chegada ) {
                    return response.status(403).json({ err: `O caminhao não possui o peso de entrada. Atualize o caminhao para o status ${evento_pos_pesagem_1} e insira o valor do peso antes de prosseguir para outro status` });
                } else {
                    next();
                }
            } else {
                next();
            };

        } else if ( indice_status > stats.status.indexOf( evento_pos_pesagem_2 ) ) {

            if ( caminhao ) {
                if ( !caminhao.Peso_saida ) {
                    return response.status(403).json({ err: `O caminhão não possui o peso de saída. Atualize o caminhão para o status ${evento_pos_pesagem_2} e insira o valor do peso antes de prosseguir para outro status` });
                } else {
                    next();
                }
            } else {
                next();
            };

        } else {
            next();
        };

    },

    // Função para autorizar o usuário a mudar o status dependendo do tempo desde o ultimo refresh
    // no frontend
    async autorizaAtualizacaoStatus( request, response, next ){
        const { ID, Atualizado, Atualizado_por } = request.body;

        const [ caminhao ] = await connection('fCarregamento')
                                            .select('*')
                                            .where('ID', '=', ID);

        if ( caminhao ) {
            
            // Se a ultima vez que o usuário atualizou for depois da ultima atualização do dado do sqlite
            if ( Atualizado >= caminhao.Atualizado || Atualizado_por === caminhao.Atualizado_por ) {

                // Usuário autorizado a mudar os dados, continuar para a próxima função
                next();

            } else {
                // Usuario não autorizado a mudar os dados, responder o erro
                return response.status(409).json({ err: 'A atualização poderá conflitar com os dados presentes no servidor. Atualize o navegador ou clique no botão "buscar" e tente novamente.' });
            };

        } else {
            
            return response.sstatus(404).josn({ err: 'Caminhão não encotrado na base de dados.' });
        };

    },

    // Módulo para buscar os dados do sqlite referentes ao caminhão pesquisado pelo usuário
    async buscar_dados_sqlite({ ID }){
        const [ caminhao ] = await  connection('fCarregamento')
                                        .select("*")
                                        .where("ID", "=", ID);

        return caminhao;
    },

    // Salva a mudança de status no sqlite
    async on_status_change({ ID, Status, Unidade, Placa, Dia }){

        await connection('fStatus')
        .insert({
            ID,
            Status,
            Unidade,
            Placa,
            Dia,
            Tipo: "Carregamento",
            DataHora: module.exports.agora(),
        })
        .catch( err => console.log(err));
    },

    // Modulo para salvar os dados do Arma no sqlite
    async salva_carregamento_sqlite({ ID, Unidade, Placa, Dia, Prioridade }){

        const Atualizado = module.exports.agora();

        // Procura um item igual no sqlite
        const db_caminhao = await   connection('fCarregamento')
                                    .select('*')
                                    .where("ID","=", ID );

        // Se não existir esses caminhões no sqlite ainda, criar um novo
        if ( db_caminhao.length === 0 ) {

            await connection('fCarregamento')
            .insert({
                ID,
                Placa,
                Dia,
                Prioridade,
                Status: 'Aguardando chegada do veículo',
                Assinaturas: JSON.stringify([]),
                Unidade,
                Atualizado,
            });

            // Caso seja a primeira aparição dessa caminhão, inserir seu status na tabela de status
            module.exports.on_status_change({
                ID,
                Status: 'Aguardando chegada do veículo',
                Unidade,
                Placa,
                Dia,
            });

        };
    },

    // Modulo para organizar os dados vindos do Arma
    formata_dados( resposta_ARMA ){

        // Agrupa o objeto retornado do Banco de dados
        const objeto_tratado = resposta_ARMA.reduce((r, { ID, Unidade, Placa, Dia, Prioridade, N_Obra, Cliente, Endereco, Ordem_entrega, Romaneio, Peso }) => {
            
            const key_caminhao = `${ID} - ${Placa} - ${Unidade} - ${Dia} - ${Prioridade}`;
            const key_entrega = `${N_Obra} - ${Cliente} - ${Endereco}`;
            const key_romaneios = `${Romaneio} - ${Peso}`;

            const caminhoes = {
                ID,
                Unidade,
                Placa,
                Dia,
                Prioridade,
                Entregas: {}
            };
          
            r[key_caminhao] = r[key_caminhao] || caminhoes;

            const entregas = {
              N_Obra,
              Cliente,
              Endereco,
              Ordem_entrega,
              Romaneios: {},
            };

            r[key_caminhao]['Entregas'][key_entrega] = r[key_caminhao]['Entregas'][key_entrega] || entregas;

            const romaneios = {
                Romaneio,
                Peso,
            };

            r[key_caminhao]['Entregas'][key_entrega]['Romaneios'][key_romaneios] = r[key_caminhao]['Entregas'][key_entrega]['Romaneios'][key_romaneios] || romaneios;
          
            return r;

        }, {});

        const arr_convertido = Object.values(objeto_tratado);

        let caminhoes_final = [];
        let entregas_final = [];

        for (let caminhao of arr_convertido) {

            for ( let entrega of Object.values(caminhao.Entregas) ) {
                
                entrega.Romaneios = Object.values( entrega.Romaneios );
                entregas_final.push( entrega );
            }

            caminhao.Entregas = entregas_final;
            entregas_final = [];
            caminhoes_final.push( caminhao );

        };

        return caminhoes_final;
    },

    // Modulo para buscar os dados do Arma e mandar para o front-end
    async get_carregamento_data( request, response ) {
        const { unidade, data } = request.body;

        console.log('Iniciou carregamento: ', data);

        const qry_mapa_carregamento = `
            SELECT
            
	            LPM_PLANNING_REF.LPM_PLANNING_REF_ID AS 'ID',
                RTRIM(LPM_PLANNING_DET.BRANC_CODE) AS 'Unidade',
                RTRIM(LPM_PLANNING_REF.VEHI_CODE) AS 'Placa',
                LPM_PLANNING_REF.LAST_DELIVERY_DATE AS 'Dia',
                LPM_PLANNING_REF.PRIORITY_NUMBER AS 'Prioridade',
                DREF.CUST_REF2 AS 'N_Obra',
                DREF.SIT_NAME AS 'Cliente',
                DREF.SIT_ADD AS 'Endereco',
                LPM_PLANNING_DET.ORDER_NUM AS 'Ordem_entrega',
                RTRIM(LPM_PLANNING_DET.PS_CODE) AS 'Romaneio',
                LPM_PLANNING_DET.WEIGHT AS 'Peso'
            
            FROM DREF
            INNER JOIN LPM_PLANNING_REF WITH (NOLOCK) ON	DREF.LPM_PLANNING_REF_ID = LPM_PLANNING_REF.LPM_PLANNING_REF_ID
            INNER JOIN LPM_PLANNING_DET WITH (NOLOCK) ON	DREF.LPM_PLANNING_REF_ID = LPM_PLANNING_DET.LPM_PLANNING_REF_ID
                                                            AND DREF.RC_NUM= LPM_PLANNING_DET.RC_NUM
                                                            AND DREF.RC_NUM = LPM_PLANNING_DET.RC_NUM
            
            WHERE
                LPM_PLANNING_REF.LAST_DELIVERY_DATE = ${data} AND
                LPM_PLANNING_DET.BRANC_CODE = ${unidade}
        `;
        
        let pool = await sql.connect(SQL_conf);

        const mapa = await  pool.request()
                                .query(qry_mapa_carregamento);

        // Caso não tenha nada no mapa buscado, retorna um array vazio
        if (mapa.recordset.length === 0 ) {
            return response.status(200).json({ caminhoes: [] });
        };

        // Organiza os dados
        const caminhoes_formatado = module.exports.formata_dados( mapa.recordset );

        // Salva cada dado retirado no arma no sqlite
        for ( const item of caminhoes_formatado ) {

            // Chama o módulo para salvar os dados no sqlite
            await module.exports.salva_carregamento_sqlite( item );
            
        }

        // Une os dados do Arma e do sqlite
        const caminhoes_final = await Promise.all(
            caminhoes_formatado.map( async item => {

                // Busca os dados referentes a esse caminhão no sqlite
                const dados_sqlite = await module.exports.buscar_dados_sqlite( item );

                // Busca os dados de status referente a esse caminhão no sqlite
                const h_status = await status_func.busca_status( item.ID );

                /// Busca os dados de comentarios referentes a esse caminhão no sqlite
                const comentarios = await coments_func.buscaDados( item.ID );

                return { ...dados_sqlite, Assinaturas: JSON.parse( dados_sqlite.Assinaturas ), h_status , comentarios, ...item, };
            })
        );

        return response.status(200).json({ caminhoes: caminhoes_final });

    },

    // Modulo para atualizar um dado dentro do sqlite
    async atualiza_status_carregamento( request, response ){
        console.log( 'Atualizou o status' );

        const { ID, Status, Peso, Comentario, Atualizado_por } = request.body;

        const [ { Unidade, Placa, Dia, Chegada } ] = await connection('fCarregamento')
                                                    .select('*')
                                                    .where('ID','=', ID)
                                                    .catch( () =>  response.status(404).json({ err: 'Caminhão não encontrado na base de dados' }));

        // Reflete a mudança do status na tabela de status do sqlite
        module.exports.on_status_change({ ID, Status, Unidade, Placa, Dia });

        /*  Se o status for do tipo 'Em carregamento',
            guardar a Hora e o peso da balança na entrada na unidade */
        if ( Status === evento_chegada ) {

            const agora = module.exports.agora();

            // Atualiza no sqlite
            await connection('fCarregamento')
            .update({
                Status,
                Chegada: agora,
                Comentario,
                Atualizado: agora,
                Atualizado_por,
            })
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });

        } else if ( Status === evento_pos_pesagem_1 ){

            const agora = module.exports.agora();

            const dados_c_chegada = {
                Status,
                Peso_chegada: Peso,
                Comentario,
                Atualizado: agora,
                Atualizado_por
            };

            const dados_s_chegada = {
                Status,
                Peso_chegada: Peso,
                Comentario,
                Atualizado: agora,
                Atualizado_por,
                Chegada: agora,
            };

            // Atualiza no sqlite
            await connection('fCarregamento')
            .update( ( [ null, undefined ].includes( Chegada ) )?dados_c_chegada:dados_s_chegada )
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });

        } else if ( Status === evento_pos_pesagem_2 ){

            const agora = module.exports.agora();

            const dados_c_chegada = {
                Status,
                Peso_saida: Peso,
                Comentario,
                Atualizado: agora,
                Atualizado_por,
                Chegada: agora,
            };

            const dados_s_chegada = {
                Status,
                Peso_saida: Peso,
                Comentario,
                Atualizado: agora,
                Atualizado_por
            };

            // Atualiza no sqlite
            await connection('fCarregamento')
            .update( ( [ null, undefined ].includes( Chegada ) )?dados_c_chegada:dados_s_chegada )
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });

        } else if ( Status === evento_saida ) {

            const agora = module.exports.agora();

            const dados_c_chegada = {
                Status,
                Saida: agora,
                Comentario,
                Atualizado: agora,
                Atualizado_por,
                Chegada: agora,
            };

            const dados_s_chegada = {
                Status,
                Saida: agora,
                Comentario,
                Atualizado: agora,
                Atualizado_por
            };

            // Atualiza no sqlite
            await connection('fCarregamento')
            .update( ( [ null, undefined ].includes( Chegada ) )?dados_c_chegada:dados_s_chegada )
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });

        } else {

            const agora = module.exports.agora();

            const dados_c_chegada = {
                Status,
                Atualizado: agora,
                Atualizado_por,
                Chegada: agora,
            };

            const dados_s_chegada = {
                Status,
                Atualizado: agora,
                Atualizado_por
            };

            // Atualiza no sqlite
            await connection('fCarregamento')
            .update( ( [ null, undefined ].includes( Chegada ) )?dados_c_chegada:dados_s_chegada )
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });
        };
    },
}