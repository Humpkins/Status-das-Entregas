import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import './style.css';
import PopUp from '../../general/popup/index';
import { useDispatch, useSelector } from 'react-redux';
import * as stats from '../staus';

import CToggle from '../../general/CToggle';
import "react-toggle/style.css";

import * as act_descarregamento from '../../../store/actions/descarregamento';
import { isAuthenticated } from '../../../scripts/isAuthenticated';
import validaStatusChange from '../../../scripts/validaStatusChange';

import _ from 'lodash';

export default function InfoBox() {

    const evento_pos_pesagem_1 = process.env.REACT_APP_DESC_EVENTO_POS_PESAGEM_1;
    const evento_pos_pesagem_2 = process.env.REACT_APP_DESC_EVENTO_POS_PESAGEM_2;
    const evento_veiculo_liberado = process.env.REACT_APP_DESC_EVENTO_SAIDA_UNIDADE;
    
    const dispatch = useDispatch();
    const history = useHistory();

    const { desc_selecionado, atualizado } = useSelector( state => state.descarregamento );
    const [ mudou, setMudou ] = useState(false);
    const [pop, setPop] = useState( false );
    const [drop, setDrop ] = useState( desc_selecionado.Status );
    const [oneClick, setOneClick] = useState();
    const [texto, setTexto] = useState();
    const [disableBnt, setDisableBtn] = useState(false);

    const [ prox, setProx ] = useState(false);
    const [ oneClickProx, setOneClickProx ] = useState(false);

    // Verifica se existe um caminhao selecionado ou se existe um caminhao selecionado salvo no localstorage
    useEffect(() => {

        // Se o estado 'selecionado' está vazio, buscar os dados no localstorage
        if ( _.isEqual({}, desc_selecionado) ) {

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
                rolePermissions = JSON.parse( process.env.REACT_APP_DESC_ROLES_PORTARIA );
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
                rolePermissions = JSON.parse( process.env.REACT_APP_DESC_ROLES_EXPEDICAO );
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

    // Formata a hora do formato YYYYMMSSHHmmSS em DD/MM/YYYY HH:mm
    const formataDataHora = ( int_data )  => {

        const str_data = String(int_data);
        const f_str_data = str_data.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$3/$2/$1 $4:$5");
        return f_str_data;
    };

    const Dropdown = ({itens, id, padrao}) => {
        const estilo = {
            gridArea: 'dropdown',
            justifySelf: 'end',
            width: '100%',
        };

        const mudaItem = (e) => {

            if ( desc_selecionado.Status === e.target.value ){
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
                style={estilo}
                onChange={ e => mudaItem(e) } 
                defaultValue={ padrao }
            >
                {itens && itens.map( ( item, index ) => <option key={index} value={item}> {item} </option>)}
            </select>
        );
    };

    const LiMaterial = ({ item }) => {
        return (
            <li>
                <div className="li-main">
                    <h3> {item.Material} </h3>
                    <h3> {item.Peso} Kg </h3>
                </div>

                <div className="li-remain">
                    <div className="esquerda">
                        <span> Material: {parseFloat(item.Cod_Material)} </span>
                        <span> Remessa: {item.Remessa} </span>
                    </div>

                    <div className="direita">
                        <span> NF: {parseFloat(item.N_nota_fiscal)} </span>
                        <span> Pedido: {item.Item_pedido} </span>
                    </div>
                </div>
            </li>
        );
    };

    const LiEventos = ({ item, showLine = true }) => {

        const estilo_linha = {
            width: "1px",
            height: "60px",
            background: "black"
        };

        const estilo_status_timeline = { 
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        };

        return (
            <li>
                {(showLine)?<div className="linha_vertical" style={estilo_linha}/>:false}
                <div className="status_timeline" style={estilo_status_timeline}>
                    <h3> { item.Status } </h3>
                    <span> { formataDataHora(item.DataHora) } </span>
                </div>
            </li>
        );
    };

    const Eventos = () => {
        return(
                <div className="eventos" style={{display: ( desc_selecionado )?"block":"none"}}>
                    <div className="info-header" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                        <span> Eventos </span>
                        <div />
                    </div>
                    
                    {( desc_selecionado.h_status.length !== 0 )?
                        <ul>
                            { desc_selecionado.h_status && desc_selecionado.h_status.map( (item, index) =>  <LiEventos key={index} item={item} showLine={(index === 0)?false:true} />) }
                        </ul>:
                        false
                    }
                </div>
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

        //  Verifica se está autenticado
        const { isAuth, token } = await isAuthenticated();

        if ( !isAuth ) {

            setDisableBtn(false);
            
            // Caso não esteja, mandar para a tela de logIn
            alert('Desconectado da seção. Faça o login e tente novamente!');
            history.push('/LogIn');
        } else {

            const lista_pops = [evento_pos_pesagem_1, evento_pos_pesagem_2];

            if ( !lista_pops.includes(status || drop) ) {
    
                const response = await act_descarregamento.Status_change( status || drop, desc_selecionado, null, token, atualizado );
                if ( response.status === 200 ){

                    dispatch( act_descarregamento.reducer_status_change( status || drop, desc_selecionado, null ) );
                    history.push('/');
                    

                } else {
                    alert( response.data.err );
                };

                setDisableBtn(false);
    
            } else {
    
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

                setDisableBtn(false);

                const response = await validaStatusChange( status || drop, desc_selecionado.ID, token, 'descarregamento' );

                if ( response.status === 200 ) {
                    muda_texto().then( () => setPop(true) );
                } else {
                    alert( response.data.err );
                }
    
            };
        };

    };

    const formSubmit_oneClick = (e) => {

        prox_status(drop).then( stat => {
            formSubmit(e, stat);
        });

    };

    const estilo_botao = {
        gridArea: "botoes",
        width: '300px',
        padding: '0 10px',
    };

    const reducer_peso = ({ valor, arr }, row) => {
        
        if ( !arr.includes( row.N_nota_fiscal ) ) {
            arr.push( row.N_nota_fiscal );
            
            valor = (valor + row.Peso)
        };
        
        return { valor, arr };
    };

    const warningEstiloso = {
        textAlign: 'center',
        padding: '8px 0',
        width: '400px',
        minHeight: '38.5px',
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

    return (
        <>
            { pop &&    <PopUp
                            texto={ texto } func_visivel={ setPop }
                            status={ oneClick || drop } ID={ desc_selecionado.ID }
                            tipo={ 'descarregamento' } setDrop = { setDrop }
                            btnDisplay={disableBnt}
                            setDisableBtn={setDisableBtn}
                            atualizado = { atualizado }
                        />
            }
            <div className="info-box">
                <form className="box-header" onSubmit={ (e) => formSubmit(e) }>

                    { (  mudou && prox )?
                        <button
                            style={estilo_botao}
                            type="submit"
                            disabled={disableBnt} >
                                Atualizar
                        </button>:
                      ( mudou && !prox ) &&
                        <div style={alertEstiloso} > Você não pode atualizar para esse status </div>
                    }

                    { ( !mudou && oneClickProx && desc_selecionado.Status !== evento_veiculo_liberado )?
                        <button
                            style={estilo_botao}
                            disabled={disableBnt}
                            onClick={ e => formSubmit_oneClick(e) } >
                                Sinalizar { prox_status_botao( desc_selecionado.Status ) }
                        </button>:
                      ( !mudou && !oneClickProx && desc_selecionado.Status !== evento_veiculo_liberado ) &&
                        <div style={warningEstiloso} > Aguarde a atualização { stats.status[ stats.status.indexOf( drop ) + 1 ] } </div>
                    }

                    <CToggle tipo='descarregamento'/>

                    <Dropdown itens={stats.status} id="status" padrao={ drop } />
                </form>

                <div className="truck-info">
                    <div className="esquerda">
                        <div className="nome">
                            <h3> { desc_selecionado.Nome } </h3>
                            <h6> Nome </h6>
                        </div>

                        <div className="placa">
                            <h3> { desc_selecionado.Placa } </h3>
                            <h6> Placa </h6>
                        </div>

                        <div className="chegada">
                            <h3> { (desc_selecionado.Chegada)?formataDataHora(desc_selecionado.Chegada):'-' } </h3>
                            <h6> Chegada </h6>
                        </div>
                    </div>

                    <div className="direita">
                        <div className="transportadora">
                            <h3> { desc_selecionado.Transportadora } </h3>
                            <h6> Transportadora </h6>
                        </div>

                        <div className="modal">
                            <h3> { desc_selecionado.Modal } </h3>
                            <h6> Modal </h6>
                        </div>

                        <div className="saida" >
                            <h3> { (desc_selecionado.Saida)?formataDataHora(desc_selecionado.Saida):'-' } </h3>
                            <h6> Saida </h6>
                        </div>
                    </div>

                </div>

                <div className="Pesos">
                    <div className="info-header" >
                            <span> Pesos </span>
                            <div />
                    </div>
                    <div className="Pesos_valor">
                        <div>
                            <h3> { desc_selecionado.Materiais && ( desc_selecionado.Materiais.reduce( reducer_peso, { valor: 0, arr: [] }).valor || '-' ) } kg </h3>
                            <h6> Peson NF </h6>
                        </div>
                        <div>
                            <h3> { desc_selecionado.Peso_chegada || '-'} kg </h3>
                            <h6> Peso na entrada </h6>
                        </div>
                        <div>
                            <h3> { desc_selecionado.Peso_saida || '-'} kg </h3>
                            <h6> Peso na saida </h6>
                        </div>
                    </div>
                </div>

                <div className="materiais">
                    <div className="info-header" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                        <span> Materiais </span>
                        <div />
                    </div>

                    <ul className="ul_material">
                        { !_.isEmpty(desc_selecionado) && desc_selecionado.Materiais.map(  ( item, index ) => <LiMaterial key={index} item={ item }/>) }
                    </ul>
                </div>

                { desc_selecionado.h_status &&  <Eventos /> }


            </div>
        </>
    );
}