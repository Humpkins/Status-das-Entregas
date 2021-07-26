import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PopUp from '../general/popup/index';
import * as stats from './status';

// import Map from '../general/maps/index';

import * as act_carregamento from '../../store/actions/carregamento';
import { isAuthenticated } from '../../scripts/isAuthenticated';
import validaStatusChange from '../../scripts/validaStatusChange';

import _ from 'lodash';

import './style.css';

import Table from '../general/Table';
import Header from '../general/Header';
import Detalhe from '../general/detalhe caminhão';
import CarrEventos from './maisDetalhes';

import ComentsBox from '../general/comentarios';

import CToggle from '../general/CToggle';

export default function DetalheCarregamento(){

    const evento_pos_pesagem_1 = process.env.REACT_APP_CARR_EVENTO_POS_PESAGEM_1;
    const evento_pos_pesagem_2 = process.env.REACT_APP_CARR_EVENTO_POS_PESAGEM_2;
    const evento_veiculo_liberado = process.env.REACT_APP_CARR_EVENTO_SAIDA_UNIDADE;

    const dispatch = useDispatch();

    const { carr_selecionado, atualizado } = useSelector( state => state.carregamento );
    const [ mudou, setMudou ] = useState( false );
    const [ pop, setPop] = useState( false );
    const [ drop, setDrop ] = useState( carr_selecionado.Status );
    const [ oneClick, setOneClick ] = useState();
    const [ texto, setTexto ] = useState();
    const [ disableBtn, setDisableBtn ] = useState(false);

    const [ prox, setProx ] = useState(false);
    const [ oneClickProx, setOneClickProx ] = useState(false);

    const history = useHistory();

    // Verifica se existe um caminhao selecionado ou se existe um caminhao selecionado salvo no localstorage
    useEffect(() => {

        // Se o estado 'selecionado' está vazio, voltar para a home
        if ( _.isEqual({}, carr_selecionado) ) {

            history.goBack();

        }

    });

    // Controla se os botões de atualizar e "proximo status" devem ficar visíveis
    useEffect( () => {

        const dados = localStorage.getItem('dados');
        if ( !dados ) { alert('Erro ao buscar os dados do usuário. Faça o login novamente.'); return;};
        const { Role } = JSON.parse( dados );
        var rolePermissions, prox_status;

        switch ( Role ){
            case 'Admin':
                setProx(true);
                setOneClickProx(true);
                break;

            case 'Portaria':
                rolePermissions = JSON.parse( process.env.REACT_APP_CARR_ROLES_PORTARIA );
                if ( rolePermissions.includes( drop ) ) {
                    setProx(true);
                } else setProx(false);

                prox_status = ( stats.status.indexOf( drop ) < stats.status.length )?stats.status[ stats.status.indexOf( drop ) + 1 ]:drop;

                if ( rolePermissions.includes( prox_status ) ){
                    setOneClickProx(true);
                } else {
                    setOneClickProx(false);
                };
                break;

            case 'Expedicao':
                rolePermissions = JSON.parse( process.env.REACT_APP_CARR_ROLES_EXPEDICAO );
                if ( rolePermissions.includes( drop ) ) {
                    setProx(true);
                } else setProx(false);

                prox_status = ( stats.status.indexOf( drop ) < stats.status.length )?stats.status[ stats.status.indexOf( drop ) + 1 ]:drop;

                if ( rolePermissions.includes( prox_status ) ){
                    setOneClickProx(true);
                } else {
                    setOneClickProx(false);
                };
                break;

            case 'Visitante':
                setProx(false);
                setOneClickProx(false);
                break;

            default:
                { alert('Erro ao buscar os dados do usuário. Faça o login novamente.'); return;}
        };

    }, [drop]);
    
    // Componente do dropdown
    const Dropdown = ({itens, id, padrao}) => {
        const stilo = {
            gridArea: "dropdown",
        };

        const mudaItem = (e) => {

            if ( carr_selecionado.Status === e.target.value ){
                setDrop(e.target.value);
            } else {
                setDrop(e.target.value);
            };

            setMudou(true);
            
        };

        return(
            <select
                id={id}
                name={id}
                style={stilo}
                onChange={ (e) => mudaItem(e) }
                defaultValue={padrao}
            >
                {itens && itens.map(( item, index ) => 
                    <option
                        key = {index}
                        value={item}> {item}
                    </option>)}
            </select>
        );
    };

    // Texto a ser mostrado no botão de umClique
    const prox_status_botao = ( status ) => {

        const indice = stats.status.indexOf( status );
        
        if ( indice < ( stats.status.length - 1 ) && indice !== -1) {
            return stats.prox_status[ indice ];
        }
    };

    // Próximo estatus após o atual
    const prox_status = ( status ) => {

        return new Promise( ( resolve, reject ) => {

            const indice = stats.status.indexOf( status );

            if ( indice < ( stats.status.length - 1 ) && indice !== -1) {
                setOneClick( stats.status[ indice + 1 ] );

                resolve( stats.status[ indice + 1 ] );
            } else {
                reject('O item é o final da lista');
            };

        });

    };

    // Manda os dados para o backend
    const formSubmit = async (e, status = undefined) => {

        e.preventDefault();

        setDisableBtn(true);

        // Verificar se está autenticado
        const { isAuth, token } = await isAuthenticated();

        if ( !isAuth ) {

            // Caso não esteja, mandar para a tela de logIn
            alert('Desconectado da seção. Faça o login e tente novamente!');
            history.push('/LogIn');

            setDisableBtn(false);

        } else {

            const lista_pops = [ evento_pos_pesagem_1, evento_pos_pesagem_2 ];

            if ( !lista_pops.includes(status || drop) ) {
    
                // Atualiza o status na base de dados
                const response = await act_carregamento.Status_change( status || drop, carr_selecionado, null, token, atualizado );
                if ( response.status === 200 ) {

                    setDisableBtn(false);

                    // Atualiza o status no reducer
                    dispatch( act_carregamento.reducer_status_change( status || drop, carr_selecionado, null ) );
                    history.push('/');
                    
                } else {

                    setDisableBtn(false);
                    alert( response.data.err );
                };
    
            } else {

                setDisableBtn(false);
    
                // Muda o texto a ser exibido no pop-up
                const muda_texto = () => (
                    new Promise( (resolve, reject) => {
                        if ( [status, drop].includes( evento_pos_pesagem_1 ) ) {
                            setTexto('Insira o peso do caminhão (Kg) na entrada:');
                            resolve();
                        } else if ( [status, drop].includes( evento_pos_pesagem_2 ) ) {
                            setTexto('Insira o peso do caminhão (Kg) na saída:');
                            resolve();
                        };
                    })
                );

                const response = await validaStatusChange( status || drop, carr_selecionado.ID, token, 'carregamento' );

                if ( response.status === 200 ) {
                    muda_texto().then( () => setPop(true) );
                } else {
                    alert( response.data.err );
                }
    
            };

        }

    };

    const formSubmit_oneClick = (e) => {

        prox_status(drop).then( stat => {
            formSubmit(e, stat);
        });

    };

    const warningEstiloso = {
        textAlign: 'center',
        paddingTop: '8px',
        width: '400px',
        height: '38.5px',
        borderRadius: '100px',
        background: 'rgba(0, 0, 255, 0.2)',
        color: 'white',
    };

    const alertEstiloso = {
        textAlign: 'center',
        paddingTop: '8px',
        width: '400px',
        height: '38.5px',
        borderRadius: '100px',
        background: 'rgba(255, 0, 0, 0.2)',
        color: 'white',
    };

    return(
        <>
            {   pop &&
                <PopUp
                    texto={ texto } func_visivel={ setPop }
                    status={ oneClick || drop } ID={ carr_selecionado.ID }
                    tipo={ 'carregamento' } setDrop = { setDrop }
                    btnDisplay={disableBtn}
                    setDisableBtn={setDisableBtn}
                    atualizado={ atualizado }
                />
            }

            <div className="detalhe_wrapper">
                <Header />
                <form style={{marginTop: "60px"}} onSubmit={e => formSubmit(e)}>
                    <div className="inputs" >

                        <div className="input_placa" style={{gridArea: "placa"}}>
                            <h2> { carr_selecionado.Placa } </h2>
                            <h6> Placa </h6>
                        </div>

                        <Dropdown itens={stats.status} id={"status"} padrao={ drop } />

                        <CToggle tipo='carregamento' />

                        { ( mudou && prox )?
                            <button
                                type='submit'
                                disabled={disableBtn}
                                style={{gridArea: "atualizar", width: '400px'}}>
                                    Atualizar
                            </button>:
                          ( mudou && !prox ) &&
                             <div style={alertEstiloso} > Você não pode atualizar para esse status </div>
                        }
                        
                        { ( !mudou && oneClickProx && carr_selecionado.Status !== evento_veiculo_liberado )?
                            <button
                                onClick={ (e) => formSubmit_oneClick(e) }
                                type='button'
                                disabled={disableBtn}
                                style={{ gridArea: "atualizar", width: "400px" }}>
                                        Sinalizar { prox_status_botao( carr_selecionado.Status ) }
                            </button>:
                          ( !mudou && !oneClickProx && carr_selecionado.Status !== evento_veiculo_liberado ) &&
                            <div style={warningEstiloso} > Aguarde a atualização { stats.status[ stats.status.indexOf( drop ) + 1 ] } </div>
                        }

                    </div>

                    <div className="imagem" style={{display: "flex"}}>
                        <Table colunas={ ['Romaneio', 'Peso'] } />

                        <Detalhe />

                        <ComentsBox tipo='carregamento' />

                        {/* <Map rota={ carr_selecionado.Entregas } /> */}

                    </div>

                </form>
                { carr_selecionado.h_status && <CarrEventos /> }
            </div>
        </>
    );
}