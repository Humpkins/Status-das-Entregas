const axios = require('axios').default;
const https = require('https');
const connection = require('../database/connection');

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

    formataDataHora( int_data ){

        const str_data = String(int_data);
        const f_str_data = str_data.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$3/$2/$1 $4:$5");
        return f_str_data;
    },

    async alertComment( request, response, next ){
        const { ID_caminhao, Tipo, Comentario, Usuario, Email } = request.body;

        const enviaEmail = async ( caminhao ) => {
            
            const url = 'https://prod-140.westus.logic.azure.com:443/workflows/c1a88e028aa84752b0c606a03dc18490/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=gJjFR7jamZ4Pd7atWl58Bg04H6Cb2jgoTrZR8wOVzpo';
            const [{ Assinaturas, Placa }] = caminhao;

            var Prioridade, Materiais;
            if ( Tipo === 'carregamento' ) Prioridade = caminhao[0].Prioridade
            else if ( Tipo === 'descarregamento' ) Materiais = caminhao[0].Materiais
            
            const Emails = JSON.parse( Assinaturas ).filter( item => module.exports.agora() <= item.Validade && Email !== item.Email );

            const Tópico = `(${ ( Tipo === 'carregamento' )?"Prioridade " + caminhao[0]['Prioridade']:" Material " + JSON.stringify( JSON.parse( caminhao[0].Materiais )[0]['Material'] ) }) Atualização de comentários para o caminhão de placa ${ Placa }`;

            const Mensagem = `Foram postados novos comentarios:
                                <br/><br/>
                                ${ module.exports.formataDataHora( module.exports.agora() ) }
                                <span Style='font-weight: bold'>${ Usuario }</span>: ${ Comentario }
                                <br/><br/>
                                ${ ( Tipo === 'carregamento' )?"Prioridade: <span Style='font-weight: bold'>" + caminhao[0]['Prioridade'] + '</span>':JSON.stringify( JSON.parse( caminhao[0].Materiais )[0]['Material'] ) }`;

            const body = {
                Emails,
                Tópico,
                Mensagem,
            };

            // At request level
            const agent = new https.Agent({  
                rejectUnauthorized: false
            });
   
            axios.post( url, body, {  httpsAgent: agent } ).then( resposta => {
                if ( resposta.status === 200 ) next()
                else return response.status(400).json({ err: 'Ocorreu um erro ao enviar os emails de alerta.' });
            })
            .catch( err => console.log(err) );

        };

        if ( Tipo === 'carregamento' ) {

            const carr_caminhao = await connection('fCarregamento')
                                        .select('*')
                                        .where('ID', '=', ID_caminhao);

            await enviaEmail( carr_caminhao );

        } else {

            const desc_caminhao = await connection('fDescarregamento')
                                        .select('*')
                                        .where('ID', '=', ID_caminhao);

            await enviaEmail( desc_caminhao );

        };
    },

    async alertStatus( request, response, next ){
        const { ID, tipo, Status, Atualizado_por, Email } = request.body;

        const enviaEmail = async ( caminhao ) => {
            
            const url = 'https://prod-140.westus.logic.azure.com:443/workflows/c1a88e028aa84752b0c606a03dc18490/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=gJjFR7jamZ4Pd7atWl58Bg04H6Cb2jgoTrZR8wOVzpo';
            const [{ Assinaturas, Placa }] = caminhao;

            var Prioridade, Materiais;
            if ( tipo === 'carregamento' ) Prioridade = caminhao[0].Prioridade;
            else if ( tipo === 'descarregamento' ) Materiais = caminhao[0].Material;
            
            const Emails = JSON.parse( Assinaturas ).filter( item => module.exports.agora() <= item.Validade && Email !== item.Email );

            const Tópico = `(${ ( tipo === 'carregamento' )?"Prioridade " + caminhao[0]['Prioridade']:" Material " + JSON.stringify( JSON.parse( caminhao[0].Materiais )[0]['Material'] ) }) Atualização de status do caminhão de placa ${ Placa }`;

            const Mensagem = `${ Atualizado_por } alterou o status do caminhão ${ Placa } para:
                                <br/>
                                ${ module.exports.formataDataHora( module.exports.agora() ) }
                                <span Style='font-weight: bold'>${ Status }</span>
                                <br/><br/>
                                ${ ( tipo === 'carregamento' )?"Prioridade: <span Style='font-weight: bold'>" + caminhao[0]['Prioridade'] + "</span>":JSON.stringify( JSON.parse( caminhao[0].Materiais )[0]['Material'] ) }`;

            const body = {
                Emails,
                Tópico,
                Mensagem,
            };

            // At request level
            const agent = new https.Agent({  
                rejectUnauthorized: false
            });
   
            axios.post( url, body, {  httpsAgent: agent } ).then( resposta => {
                if ( resposta.status === 200 ) next()
                else return response.status(400).json({ err: 'Ocorreu um erro ao enviar os emails de alerta.' });
            })
            .catch( err => console.log(err) );

        };

        if ( tipo === 'carregamento' ) {

            const carr_caminhao = await connection('fCarregamento')
                                        .select('*')
                                        .where('ID', '=', ID);

            await enviaEmail( carr_caminhao );

        } else {

            const desc_caminhao = await connection('fDescarregamento')
                                        .select('*')
                                        .where('ID', '=', ID);

            await enviaEmail( desc_caminhao );

        };
    },

}