import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import './style.css';
import api from '../../services/api';

import { useDispatch } from 'react-redux';
import * as act_users from '../../store/actions/users';

import { FiLogIn } from 'react-icons/fi';

export default function SignIn(){
    
    const [ email, setEmail ] = useState('');
    const [ senha, setSenha ] = useState('');
    const [ visivel, setVisivel ] = useState(false);

    const history = useHistory();
    const dispatch = useDispatch();

    const onSubmitFunc = async (e) => {
        e.preventDefault();

        const payload = {
            Email: email,
            Senha: senha,
        };

        const { data } = await api.post('logUser', payload);

        // Salva o logIn status dele
        dispatch( act_users.atualizaLoginStatus( data.auth ) );

        // Se o usuário não existir ou o email/senha estiver errado
        if ( !data.auth ) {
            alert( data.err );
        
        // Se o usuário existir
        } else {
            // Salva o token no localstorage
            localStorage.setItem('token', data.token);

            // Salva os dados do usuário no localstorage
            const dados = { Nome: data.Nome, Email: data.Email, Unidade: data.Unidade, Role: data.Role };
            localStorage.setItem('dados', JSON.stringify(dados));

            history.push('/');
        };

    };

    return(
        <div className="login_wrapper">
            <form onSubmit={ e => onSubmitFunc(e) } >
                <h3> Bem vindo! </h3>
                Email <input
                            value={email}
                            type='email'
                            onChange={ e => setEmail(e.target.value)} />

                Senha <input
                            value={senha}
                            type={(visivel)?'text':'password'}
                            onChange={ e => setSenha(e.target.value) }
                            autoComplete="on" />

                <div> <input
                            value={visivel}
                            type='checkbox'
                            onChange={ () => setVisivel(!visivel) }/> Mostrar senha </div>

                <button> Log In </button>

                <Link to='/signIn' className="signin_wrapper">
                    É novo? Faça o signin <button> <FiLogIn /> </button>
                </Link>
            </form>
        </div>
    );
};