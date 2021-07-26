import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import './style.css';
import api from '../../services/api';

import * as act_users from '../../store/actions/users';

const Unidade = ({ unidade, setUnidade }) => {
    const estilo = {
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
    };

    return(
        <div style={estilo}>
            Unidade <input valor={unidade} onChange={e => setUnidade( e.target.value )} type='number'/>
        </div>
    );
};

const LogIn = () => {

    const history = useHistory();
    const dispatch = useDispatch();

    const [ visivel, setVisivel] = useState(false);
    const [ entidade, setEntidade ] = useState();
    const [ nome, setNome ] = useState('');
    const [ senha, setSenha ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ unidade, setUnidade ] = useState(undefined);

    const justifica_nome = ( nome ) => {
        const novoNome =  nome.replace(
            /\w\S*/g,
            (str) => {
              return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
            }
        );

        setNome(novoNome);
    };

    const formSubmit = async ( e ) => {

        e.preventDefault();

        if ( [ visivel, entidade, nome, senha, email ].includes(undefined) ) {
            alert( 'Todos os campos devem ser preenchidos' );
        } else {

            const payload = {
                Nome: nome,
                Email: email,
                Senha: senha,
                Agente: entidade,
                Unidade: unidade,
            };

            const { data } = await api.post('createUser', payload );

            dispatch( act_users.atualizaLoginStatus( data.auth ) );

            if ( !data.auth ) {
                alert(  data.err );
            } else {
                alert( data.message );
                
                // Salva o token no localstorage
                localStorage.setItem('token', data.token);

                // Salva os dados do usuário no localstorage
                const dados = { Nome: data.Nome, Email: data.Email, Unidade: data.Unidade };
                localStorage.setItem('dados', JSON.stringify(dados));

                history.push('/');
            };
        };

    };

    return(

        <div className='LogIn_Wrapper' >
            <form onSubmit={e => formSubmit(e)} >
                <h3> Bem vindo! </h3>
                Nome  <input value={nome} onChange={ e => justifica_nome(e.target.value) } style={{ marginBottom: '10px' }} type="text" required />
                email <input value={email} onChange={ e => setEmail( e.target.value ) } style={{ marginBottom: '10px' }} type="email" required />
                senha <input value={senha} onChange={ e => setSenha( e.target.value ) } type={(visivel === true)?'text':'password'} autoComplete="on" required />
                <div> <input type='checkbox' onClick={() => setVisivel( !visivel )} /> Mostrar senha </div>
                
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }} className="radio">
                    <div> <input type="radio" name='Entidade' value='Interno' onClick={() => setEntidade(true) } /> Interno </div>
                    <div> <input type="radio" name='Entidade' value='Externo' onClick={() => setEntidade(false) } /> Externo </div>
                </div>

                { ( entidade && (entidade === true) ) && <Unidade unidade={unidade} setUnidade={setUnidade}/>}
                
                <button type='submit' style={{ marginTop: '20px' }} > Sign in </button>
            </form>
        </div>
    );
};

export default LogIn;