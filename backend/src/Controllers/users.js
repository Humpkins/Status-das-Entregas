const bcrypt = require('bcrypt');
const connection = require('../database/connection');
const jwt = require('jsonwebtoken');

module.exports = {
    async createUser( request, response ){

        const { Email, Senha, Nome, Agente, Unidade } = request.body;

        const [ cEmail ] = await connection('dUsers')
                                .select('Email')
                                .where('Email', '=', Email)
                                .catch ( err => console.log(err) );

        if ( cEmail ) {
            return response.status(409).json({ err: 'Email já existe!', auth: false });
        } else {

            if ( Agente === true ) {
                // Caso seja funcionario interno
    
                // Deve ser fornecido a unidade para cadastro
                if ( Unidade ) {
    
                    // Cria o usuário interno
                    bcrypt.hash( Senha, 10, async (err, hash) => {
                        if ( err ) {
                            return response.status(400).json({ err, auth: false });
                        };
            
                        await connection('dUsers')
                        .insert({
                            Email,
                            Senha: hash,
                            Nome,
                            Agente,
                            Unidade
                        })
                        .catch ( err => console.log(err) );

                        const [ ID ] = await connection('dUsers')
                                                .select("ID")
                                                .where('Email', '=', Email);

                        const token = jwt.sign({ ID }, 'jwdSecret', {
                            expiresIn: 28800, // Segundos
                        });
                
                        return response.status(200).json({ message: 'Usuário criado com sucesso!', auth: true, token, Email, Nome, Agente, Unidade });
            
                    });
    
                } else {
                    return response.status(401).json({ err: 'O código da unidade deve ser fornecido.', auth: false });
                };
    
            } else {
                // Caso seja funcionario externo
    
                // Cria o usuário externo
                bcrypt.hash( Senha, 10, async (err, hash) => {
                    if ( err ) {
                        return response.status(400).json({ err, auth: false });
                    };
        
                    await connection('dUsers')
                    .insert({
                        Email,
                        Senha: hash,
                        Nome,
                        Agente,
                        Unidade
                    })
                    .catch ( err => console.log(err) );;
            
                    const [ ID ] = await connect('dUsers')
                                            .select("ID")
                                            .where('Email', '=', Email);

                    const token = jwt.sign({ ID }, 'jwdSecret', {
                        expiresIn: 28800, // Segundos
                    });

                    return response.status(200).json({ message: 'Usuário criado com sucesso!', auth: true, token });
        
                });
    
            };

        };

    },

    async logUser( request, response ){

        const { Email, Senha } = request.body;

        const [ usuario ] = await connection('dUsers')
                                    .select('*')
                                    .where('Email', '=', Email);

        if ( !usuario ) {
            return response.status(401).json({ err: 'Usuário ou senha incorretos.', auth: false });
        };

        bcrypt.compare( Senha, usuario.Senha, ( err, result ) => {
            if ( err ) { return response.status(400).json({ err: 'Algo deu errado!', auth: false }) }

            if ( result === true ) {

                const token = jwt.sign({ ID: usuario.ID }, 'jwdSecret', {
                    expiresIn: 28800, // Segundos
                });

                return response.status(200).json({ 
                                                    mensage: 'Usuário logado com sucesso!',
                                                    auth: true,
                                                    token,
                                                    Email: usuario.Email,
                                                    Nome: usuario.Nome,
                                                    Agente: usuario.Agente,
                                                    Unidade: usuario.Unidade,
                                                    Role: usuario.Role,
                                            });
            } else {
                return response.status(401).json({ err: 'Usuário ou senha incorretos.' });
            };
        } );
    },
}