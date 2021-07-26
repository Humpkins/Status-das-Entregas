const hana = require('@sap/hana-client');
const crypto = require('crypto');
const _ = require('lodash');
const connection = require('../database/connection');
const status_func = require('./status');
const coments_func = require('./comentarios');
const stats = require('../database/status/descarregamento');
require('dotenv/config');

const evento_pos_pesagem_1 = process.env.DESC_EVENTO_POS_PESAGEM_1;
const evento_pos_pesagem_2 = process.env.DESC_EVENTO_POS_PESAGEM_2;
const evento_chegada = process.env.DESC_EVENTO_CHEGADA_UNIDADE;
const evento_saida = process.env.DESC_EVENTO_SAIDA_UNIDADE;

const HANA_conf = {
    serverNode: process.env.SERVER_HANA,
    UID: process.env.USER_HANA,
    PWD: process.env.PASSWORD_HANA,
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

        const [ caminhao ] = await connection('fDescarregamento')
                                    .select('*')
                                    .where('ID', '=', ID);

        if ( indice_status > 4 && indice_status <= 7 ) {

            if ( caminhao ) {
                if ( !caminhao.Peso_chegada ) {
                    return response.status(403).json({ err: `O caminhao não possui o peso de entrada. Atualize o caminhao para o status ${evento_pos_pesagem_1} e insira o valor do peso antes de prosseguir para outro status` });
                } else {
                    return response.status(200).json({ mensage: 'Mudança de status autorizada' });
                }
            } else {
                return response.status(200).json({ mensage: 'Mudança de status autorizada' });
            };

        } else if ( indice_status > 7 ) {

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

        const [ caminhao ] = await connection('fDescarregamento')
                                    .select('*')
                                    .where('ID', '=', ID);

        if ( indice_status > 4 && indice_status <= 7 ) {

            if ( caminhao ) {
                if ( !caminhao.Peso_chegada ) {
                    return response.status(403).json({ err: `O caminhao não possui o peso de entrada. Atualize o caminhao para o status ${evento_pos_pesagem_1} e insira o valor do peso antes de prosseguir para outro status` });
                } else {
                    next();
                }
            } else {
                next();
            };

        } else if ( indice_status > 7 ) {

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
        }

    },

    // Função para autorizar o usuário a mudar o status dependendo do tempo desde o ultimo refresh
    // no frontend
    async autorizaAtualizacaoStatus( request, response, next ){
        const { ID, Atualizado, Atualizado_por } = request.body;

        const [ caminhao ] = await connection('fDescarregamento')
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
            
            return response.status(404).json({ err: 'Caminhão não encotrado na base de dados.' });
        };

    },

    // Salva a mudança de status no sqlite
    async on_status_change({ ID, Status, Unidade, Placa, Dia }){

        connection('fStatus')
        .insert({
            ID,
            Status,
            Unidade,
            Placa,
            Dia,
            Tipo: "Descarregamento",
            DataHora: module.exports.agora(),
        })
        .catch( err => err);
    },

    // Salva os dados do SAP HANA no
    async async_salva_hana_on_sqlite( data, unidade, callback ){
    
        console.log('Iniciou importacao do hana', data);
    
        const conn = hana.createConnection();
    
        const qry_mapa_descarregamento = `
            SELECT TOP 100
                B."TKNUM" AS "ID",
                B."Plant" AS "Unidade",
                B."PurchasingDocument" AS "Pedido",
                D."ReferenceSDDocumentItem" AS "Item_pedido",
                B."Material" AS "Cod_Material",
                B."PurchasingDocumentItemText" AS "Material",
                B."EKBE_BELNR" as "Remessa",
                B."DOCDAT" AS "Dia",
                B."NFENUM" AS "N_nota_fiscal",
                B."CC_QtyBaseUnit" AS "Peso",
                B."NAME1" AS "Transportadora",
                B."Modal",
                vk."SIGNI" AS "Placa",
                vk."EXTI1" AS "Nome"
            
            FROM "_SYS_BIC"."LSA.ADM.O2C.Logistic/CV_BILLINGTRANSF" AS B
                INNER JOIN "_SYS_BIC"."BISelfService.F2P/CV_DELIVERYHISTORY" AS D ON D."DeliveryDocument" = B.EKBE_BELNR
                INNER JOIN "RBT_ST4_GE4260"."VTTK" AS vk ON vk."TKNUM" = B.TKNUM
            
            WHERE
                B."Plant" = '${unidade}' AND
                B."DOCDAT"  = ${data}
        `;
    
        conn.connect(HANA_conf, (err) => {
            if (err) return 404;
    
            conn.exec(qry_mapa_descarregamento, async (err, result) => {
                if (err) { conn.disconnect(); return 404; };
                
                conn.disconnect();

                // Organiza os dados
                const organizado = module.exports.formata_dados_v2( result );

                const dados_enviados = await Promise.all(
                    organizado.map( item => {

                        //  Salva os dados do caminhão no sqlite
                        module.exports.salva_descarregamento_sqlite_v2( item );
                        return 200;
                    })
                );

                return callback( dados_enviados[0], organizado );

            });
    
        });

    },

    // Modulo para atualizar um dado dentro do sqlite
    async atualiza_status_descarregamento( request, response ){
        const { ID, Status, Peso, Comentario, Atualizado_por } = request.body;


        const [{ Unidade, Placa, Dia, Chegada }] = await connection('fDescarregamento')
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
            await connection('fDescarregamento')
            .update({
                Status,
                Chegada: agora,
                Comentario,
                Atualizado: agora,
                Atualizado_por
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
                Atualizado_por,
                Chegada: agora,
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
            await connection('fDescarregamento')
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
            await connection('fDescarregamento')
            .update( ( [ null, undefined ].includes( Chegada ) )?dados_c_chegada:dados_s_chegada )
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });

        } else if ( Status === evento_saida ){

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
            await connection('fDescarregamento')
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
            await connection('fDescarregamento')
            .update( ( [ null, undefined ].includes( Chegada ) )?dados_c_chegada:dados_s_chegada )
            .where( 'ID', '=', ID )
            .catch( (err) => {
                return response.status(404).json({ error: err });
            });

            return response.status(200).json({ message: 'Dados atualizados com sucesso!' });

        };

    },

    // Modulo para buscar os dados referentes a um caminhao especifico no sqlite
    async busca_todos_os_dados( caminhoes ){
        const caminhoes_c_dados = Promise.all(
            caminhoes.map( async (item) => {

                const caminhao = await connection('fDescarregamento')
                                        .select('*')
                                        .where( 'ID', '=', item.ID );

                if ( caminhao.length > 0 ){
                    const [{ Status, Chegada, Saida, Peso_chegada, Peso_saida, Assinaturas }] = caminhao;

                    return { ...item, Status, Chegada, Saida, Peso_chegada, Peso_saida, Assinaturas: JSON.parse( Assinaturas ) };
                } else return item;

            })
        );

        return caminhoes_c_dados;
    },

    // #################### DEPRECATED ########################
    // Módulo para buscar os dados do sqlite referentes ao caminhão pesquisado pelo usuário
    async buscar_dados_sqlite({ ID }){
        const caminhao = await  connection('fDescarregamento')
                                .select("*")
                                .where("ID", "=", ID);

        return caminhao[0];
    },

    // #################### DEPRECATED ########################
    // Modulo para salvar os dados do SAP no sqlite
    async salva_descarregamento_sqlite({ ID, Unidade, Placa, Dia }){

        const Atualizado = module.exports.agora();

        // Procura um item igual no sqlite
        const db_caminhao = await   connection('fDescarregamento')
                                    .select('*')
                                    .where( "ID", "=", ID );

        // Se não existir esses caminhões no sqlite ainda, criar um novo
        if ( db_caminhao.length === 0 ) {

            await connection('fDescarregamento')
            .insert({
                ID,
                Placa,
                Dia,
                Status: "Aguardando chegada do veículo",
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
    // Modulo para salvar os dados do SAP no sqlite
    async salva_descarregamento_sqlite_v2({ ID, Unidade, Placa, Dia, Transportadora, Modal, Nome, Materiais }){

        const Atualizado = module.exports.agora();

        // Procura um item igual no sqlite
        const db_caminhao = await   connection('fDescarregamento')
                                    .select('*')
                                    .where( "ID", "=", ID );

        // Se não existir esses caminhões no sqlite ainda, criar um novo
        if ( db_caminhao.length === 0 ) {

            await connection('fDescarregamento')
            .insert({
                ID,
                Placa,
                Dia,
                Status: "Aguardando chegada do veículo",
                Unidade,
                Atualizado,
                Transportadora,
                Modal,
                Nome,
                Materiais: JSON.stringify(Materiais),
                Assinaturas: JSON.stringify([]),
                Atualizado_sys: Atualizado,
            });

            // Caso seja a primeira aparição dessa caminhão, inserir seu status na tabela de status
            module.exports.on_status_change({
                ID,
                Status: 'Aguardando chegada do veículo',
                Unidade,
                Placa,
                Dia
            });

        } else {

            await connection('fDescarregamento')
                    .update({
                        Placa,
                        Dia,
                        Unidade,
                        Atualizado,
                        Transportadora,
                        Modal,
                        Nome,
                        Materiais: JSON.stringify(Materiais),
                        Atualizado_sys: Atualizado
                    })
                    .where('ID', '=', ID);

        };
    },

    // #################### DEPRECATED ########################
    // Modulo para organizar os dados vindos do SAP
    formata_dados( resposta_HANA ){
        const reducer = (r, row) => {
            const key_caminhao = `${row.ID} - ${row.Unidade} - ${row.Nome} - ${row.Placa} - ${row.Transportadora} - ${row.Modal} - ${row.Dia}`;
            const key_entrega = `${row.Item_pedido} - ${row.Cod_Material} - ${row.Material} - ${row.Remessa} - ${row.Dia} - ${row.N_nota_fiscal} - ${row.Peso}`;

            const caminhoes = {
                ID: parseInt(row.ID),
                Unidade: row.Unidade,
                Nome: row.Nome,
                Placa: row.Placa,
                Transportadora: row.Transportadora,
                Modal: row.Modal,
                Dia: row.Dia,
                Material: row.Material,
                Materiais: {}
            };

            r[key_caminhao] = r[key_caminhao] || caminhoes;

            const entregas = {
                Item_pedido: row.Item_pedido,
                Cod_Material: row.Cod_Material,
                Material: row.Material,
                Remessa: row.Remessa,
                Dia: row.Dia,
                N_nota_fiscal: row.N_nota_fiscal,
                Peso: parseInt(row.Peso.replace('.', ''))
            };

            r[key_caminhao]['Materiais'][key_entrega] = r[key_caminhao]['Materiais'][key_entrega] || entregas;

            return r;
        };

        const organizado = resposta_HANA.reduce( (r, row) => reducer(r, row), {});

        const obj_organizado = Object.values(organizado);

        const obj_organizado_2 = obj_organizado.map( item => {
            item['Materiais'] = Object.values(item['Materiais']);

            return item
        });

        return obj_organizado_2;
    },
    // Modulo para organizar os dados vindos do SAP
    formata_dados_v2( resposta_HANA ){
        const reducer = (r, row) => {
            
            const key_caminhao = `${row.ID} - ${row.Unidade} - ${row.Nome} - ${row.Placa} - ${row.Transportadora} - ${row.Modal} - ${row.Dia} - ${row.Transportadora} - ${row.Modal} -${row.Nome}`;
            const key_entrega = `${row.Item_pedido} - ${row.Cod_Material} - ${row.Material} - ${row.Remessa} - ${row.Dia} - ${row.N_nota_fiscal} - ${row.Peso}`;

            const caminhoes = {
                ID: parseInt(row.ID),
                Unidade: row.Unidade,
                Status: row.Status || 'Aguardando chegada do veículo',
                Nome: row.Nome,
                Placa: row.Placa,
                Transportadora: row.Transportadora,
                Modal: row.Modal,
                Dia: row.Dia,
                Material: row.Material,
                Materiais: {},
                Assinaturas: []
            };

            r[key_caminhao] = r[key_caminhao] || caminhoes;

            const entregas = {
                Item_pedido: row.Item_pedido,
                Cod_Material: row.Cod_Material,
                Material: row.Material,
                Remessa: row.Remessa,
                Dia: row.Dia,
                N_nota_fiscal: row.N_nota_fiscal,
                Peso: parseInt(row.Peso.replace('.', ''))
            };

            r[key_caminhao]['Materiais'][key_entrega] = r[key_caminhao]['Materiais'][key_entrega] || entregas;

            return r;
        };

        const organizado = resposta_HANA.reduce( (r, row) => reducer(r, row), {});

        const obj_organizado = Object.values(organizado);

        const obj_organizado_2 = obj_organizado.map( item => {
            item['Materiais'] = Object.values(item['Materiais']);

            return item
        });

        return obj_organizado_2;
    },

    // #################### DEPRECATED ########################
    // Modulo para buscar os dados do SAP e mandar para o front-end
    async get_descarregamento_data(request, response){

        const { data, unidade } = request.body;
    
        console.log('Iniciou descarregamento', data);
    
        const conn = hana.createConnection();
    
        const qry_mapa_descarregamento = `
            SELECT TOP 100
                B."TKNUM" AS "ID",
                B."Plant" AS "Unidade",
                B."PurchasingDocument" AS "Pedido",
                D."ReferenceSDDocumentItem" AS "Item_pedido",
                B."Material" AS "Cod_Material",
                B."PurchasingDocumentItemText" AS "Material",
                B."EKBE_BELNR" as "Remessa",
                B."DOCDAT" AS "Dia",
                B."NFENUM" AS "N_nota_fiscal",
                B."CC_QtyBaseUnit" AS "Peso",
                B."NAME1" AS "Transportadora",
                B."Modal",
                vk."SIGNI" AS "Placa",
                vk."EXTI1" AS "Nome"
            
            FROM "_SYS_BIC"."LSA.ADM.O2C.Logistic/CV_BILLINGTRANSF" AS B
                INNER JOIN "_SYS_BIC"."BISelfService.F2P/CV_DELIVERYHISTORY" AS D ON D."DeliveryDocument" = B.EKBE_BELNR
                INNER JOIN "RBT_ST4_GE4260"."VTTK" AS vk ON vk."TKNUM" = B.TKNUM
            
            WHERE
                B."Plant" = '${unidade}' AND
                B."DOCDAT"  = ${data}
        `;
    
        conn.connect(HANA_conf, function(err) {
            if (err) return response.status(400).json({error: err});
    
            conn.exec(qry_mapa_descarregamento, async function (err, result) {
                if (err) { conn.disconnect(); return response.status(400).json({error: err}); };
                
                conn.disconnect();

                // Organiza os dados
                const organizado = module.exports.formata_dados( result );

                for ( const item of organizado ) {

                    //  Salva os dados do caminhão no sqlite
                    await module.exports.salva_descarregamento_sqlite( item );

                };

                // Adiciona os dados do sqlite referente aos caminhões retornados
                const descarregamento_final = await Promise.all(
                    organizado.map( async item => {

                        // Busca os dados referentes a esse caminhão no sqlite
                        const dados_sqlite = await module.exports.buscar_dados_sqlite( item );

                        // Busca os dados de status referente a esse caminhão no sqlite
                        const status = await status_func.busca_status( item.ID );

                        return { ...dados_sqlite, h_status: status, ...item };

                    })
                );
    
                return response.status(200).json({ caminhoes: descarregamento_final });
            });
    
        });
    },
    // Modulo para retornar os dados de descarregamento do sqlite para o frontend
    async get_descarregamento_data_v2( request, response ){

        const { data: Dia, unidade: Unidade } = request.body;
    
        console.log('Iniciou descarregamento', Dia);

        const result = await connection('fDescarregamento')
                            .select('*')
                            .where({ Dia, Unidade });

        // Retorna um array dos caminhoes já com suas respectivas listas de status
        const adiciona_status = async ( caminhoes_s_status ) => {
            return await Promise.all(
                    caminhoes_s_status.map( async item => {
    
                    // Busca no sqlite os dados de status referente a esse caminhão
                    const h_status = await status_func.busca_status( item.ID );

                    // Buscano sqlite os dados de comentarios referente a esse caminhão
                    const comentarios = await coments_func.buscaDados( item.ID );

                    // Busca no sqlite o status atual desse caminhão
                    const Status = await status_func.buscaStatusAtual( item.ID );
    
                    const [ { Material } ] = item.Materiais;
    
                    return { 
                        ...item,
                        Material,
                        Status,
                        h_status,
                        comentarios,
                    };
    
                })
            );
        };

        // Adiciona os dados do sqlite referente aos caminhões retornados
        const descarregamento_final = await adiciona_status( result );

        // Tempo desde que os dados desse mapa de descarregamento foram atualizados
        const tempo_desde_ultima_atualizacao = ( descarregamento_final.length !== 0 )?( module.exports.agora() - descarregamento_final[0].Atualizado_sys ):0;

        // Se os dados do hana ainda não estiverem no sqlite, passe-os para lá
        if ( descarregamento_final.length === 0 || Math.abs( tempo_desde_ultima_atualizacao ) >= 10000 ) {

            const retorna = async ( fulfilled, caminhoes ) => {

                if ( fulfilled === 200 ) {

                    // Busca no sqlite a lista de status referente a esse caminhão
                    const caminhoes_c_status = await adiciona_status( caminhoes );

                    const caminhoes_c_dados = await module.exports.busca_todos_os_dados( caminhoes_c_status );
        
                    return response.status(200).json({ caminhoes: caminhoes_c_dados });
    
                } else {
                    return response.status(400).json({ err: 'Ocorreu um erro.' });
                };
            };

            await module.exports.async_salva_hana_on_sqlite( Dia, Unidade, retorna );

        } else {

            const descarregamento_final_tratado = descarregamento_final.map( item => ({ ...item, Materiais: JSON.parse(item.Materiais), Assinaturas: JSON.parse(item.Assinaturas), }) );
            return response.status(200).json({ caminhoes: descarregamento_final_tratado });

        };

    },

}