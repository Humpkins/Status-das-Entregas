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

    async salvaDados( request, response ){

        const { ID_caminhao, Usuario, Comentario, Tipo } = request.body;

        await connection('fComentarios')
                .insert({
                    ID_caminhao,
                    Usuario,
                    Comentario,
                    Tipo,
                    Data: module.exports.agora(),
                })
                .catch( err => response.status(400).json({ err }) );

        return response.status(202);
    },

    async buscaDados( ID_caminhao ){

        const comentarios = await connection('fComentarios')
                                    .select('*')
                                    .where('ID_caminhao', '=', ID_caminhao)
                                    .catch( err => console.log(`Erro ao buscar o caminhão ${ID_caminhao} \n ${err}`));

        return comentarios;

    },
}