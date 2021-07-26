module.exports = {
    // Verifica se a role do usuário permite a alteração solicitada
    async Mid_checaRole( request, response, next ){

        const { Role, Status, tipo } = request.body;

        if ( tipo === 'carregamento' ) {

            if ( Role === 'Admin' ) {

                const carr_admin = JSON.parse( process.env.CARR_ROLES_ADMIN );

                if ( carr_admin.includes(Status) ) {
                    next();
                } else {
                    return response.status(403).json({ err: 'Processo proibido' });
                };

            } else if ( Role === 'Portaria' ) {

                const carr_portaria = JSON.parse( process.env.CARR_ROLES_PORTARIA );

                if ( carr_portaria.includes( Status ) ){
                    next();
                } else {
                    return response.status(403).json({ err: 'Processo proibido' });
                };

            } else if ( Role === 'Expedicao' ) {

                const carr_expedicao = JSON.parse( process.env.CARR_ROLES_EXPEDICAO );
                if ( carr_expedicao.includes( Status ) ) {
                    next();
                } else {
                    return response.status(403).json({ err: 'Processo proibido' });
                };
                
            } else {
                return response.status(403).json({ err: 'Processo proibido' });
            };

        } else if ( tipo === 'descarregamento' ) {

            if ( Role === 'Admin' ) {

                const desc_admin = JSON.parse( process.env.DESC_ROLES_ADMIN );
                if ( desc_admin.includes( Status ) ) {
                    next();
                } else {
                    return response.status(403).json({ err: 'Processo proibido' });
                }

            } else if ( Role === 'Portaria' ) {

                const desc_portaria = JSON.parse( process.env.DESC_ROLES_PORTARIA );
                if ( desc_portaria.includes( Status ) ) {
                    next();
                } else {
                    return response.status(403).json({ err: 'Processo proibido' });
                }

            } else if ( Role === 'Expedicao' ) {

                const desc_expedicao = JSON.parse( process.env.DESC_ROLES_EXPEDICAO );
                if ( desc_expedicao.includes( Status ) ) {
                    next();
                } else {
                    return response.status(403).json({ err: 'Processo proibido' });
                };
                
            } else {
                return response.status(403).json({ err: 'Processo proibido' });;
            };

        } else {
            return response.status(403).json({ err: 'Processo proibido' });;
        };

    },
    
};