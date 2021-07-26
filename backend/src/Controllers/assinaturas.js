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

    async criaAssinatura( request, response ){
        const { tipo, ID, Email } = request.body;

        const push_item = { Email, Validade: module.exports.agora() + 80000, };

        var base
        if ( tipo === 'carregamento' ){
            base = 'fCarregamento';
        } else if ( tipo === 'descarregamento' ) {
            base = 'fDescarregamento'
        };

        const caminhao = await connection( base )
                                .select('*')
                                .where('ID', '=', ID);

        // Verifica se o caminhão solicitado existe
        if ( !caminhao ) return response.status(404).json({ err: 'Caminhao não encontrado!' })
        else {

            var Assinaturas_obj = JSON.parse( caminhao[0].Assinaturas );

            // Verifica se o usuário já não está inscrito nesse caminhao
            if ( Assinaturas_obj.filter( item => ( item.Email === push_item.Email && module.exports.agora() <= item.Validade )).length === 0 ){

                Assinaturas_obj.push( push_item );
    
                const Assinaturas = JSON.stringify( Assinaturas_obj );
    
                await connection( base )
                        .update({
                            Assinaturas,
                        })
                        .where('ID', '=', ID);
    
                return response.status(200).json({ message: 'Inscrição feita com sucesso' });

            }
            else return response.status(409).json({ err: 'Inscrição já feita nesse caminhão' });
        };

    },

    async removeAssinatura( request, response ){
        const { tipo, ID, Email } = request.query;

        var base
        if ( tipo === 'carregamento' ){
            base = 'fCarregamento';
        } else if ( tipo === 'descarregamento' ) {
            base = 'fDescarregamento'
        };

        const caminhao = await connection( base )
                                .select('*')
                                .where('ID', '=', ID);

        // Verifica se o caminhão solicitado existe
        if ( !caminhao ) return response.status(404).json({ err: 'Caminhao não encontrado!' })
        else {

            const Assinaturas_obj = JSON.parse( caminhao[0].Assinaturas );

            const Assinaturas = JSON.stringify( Assinaturas_obj.filter( item => item.Email !== Email ) );

            await connection( base )
                    .update({
                        Assinaturas,
                    })
                    .where('ID', '=', ID);

            return response.status(200).json({ message: 'Inscrição removida com sucesso!' });

        };

    },
};