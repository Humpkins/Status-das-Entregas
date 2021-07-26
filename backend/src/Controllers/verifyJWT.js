const jwt = require('jsonwebtoken');
const connection = require('../database/connection');

module.exports = {
    async middleware_verifyJWT( request, response, next ){
        
        const token = request.headers['x-access-token'];

        if (!token){
            return response.status(401).json({ err: 'Erro na autenticação', auth: false });
        } else {
            jwt.verify( token, "jwdSecret", (err, decoded ) => {
                if (err) return response.status(401).json({ err: 'Erro na autenticação', auth: false });

                next();
            });
        }
    }, 

    async verifyJWT( request, response ){
        const token = request.headers['x-access-token'];
        const { Email } = request.query;

        if (!token){
            return response.status(401).json({ err: 'Erro na autenticação', auth: false });
        } else {
            jwt.verify( token, "jwdSecret", async (err, decoded ) => {

                if (err) {
                    return response.status(401).json({ err: 'Erro na autenticação', auth: false });
                } else {

                    const [ user ] = await connection('dUsers')
                                                        .select('*')
                                                        .where('Email', '=', decodeURIComponent(Email) );

                    if ( user ){
                        return response.status(200).json({ mensage: 'Autenticado com sucesso!', auth: true });
                    } else {
                        return response.status(401).json({ err: 'Erro na autenticação', auth: false });
                    };

                };

            });
        }
    },
}