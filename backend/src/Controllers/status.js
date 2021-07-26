const _ = require('lodash');
const connection = require('../database/connection');


module.exports = {

    async busca_status_http( request, response ){

        const { ID } = request.params;

        if ( !ID ){
            return response.status(404).json({ error: 'Caminhão não encontrado' });
        };

        const status =  await   connection('fStatus')
                                .select('*')
                                .where('ID', '=', ID);
                                
        if (!status || status.length === 0) {
            return response.status(404).json({ error: 'Caminhão não encontrado' });
        };

        return response.status(200).json({ status_list: status });
    },

    async busca_status( ID ){

        if ( !ID ){
            return [];
        };

        const status =  await   connection('fStatus')
                                .select(['Status', 'DataHora', 'Comentario'])
                                .where('ID', '=', ID);

        const formated_status = Object.values( status );

        return formated_status;

    },

    async buscaStatusAtual( ID ){
        const caminhoes = await connection('fDescarregamento')
                                .select('*')
                                .where('ID', '=', ID);

        if ( caminhoes.length !== 0 ) {
            return caminhoes[0].Status;
        } else return null;
    }
}