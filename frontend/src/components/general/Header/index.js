import React, { useState, useEffect } from 'react';

import { Alert } from '@material-ui/lab';
import { Collapse } from '@material-ui/core';

import './style.css';
import gerdau_logo from './gerdau_ico.png';
import { useDispatch, useSelector } from 'react-redux';
import * as selData from '../../../store/actions/selData'

import { useHistory } from 'react-router';

import { agora } from '../../../scripts/agora';

const Alerta = () => {

    const { atualizado } = useSelector( state => state.carregamento );

    const [ open, setOpen ] = useState( false );

    useEffect( () => {
        if ( agora() - atualizado > 1500) {
            setOpen(true);
        }

    // eslint-disable-next-line
    }, []);

    return(
        <Collapse in={open} >
            <Alert
                severity="warning"
                onClose={ () => setOpen(false) } >
                    Os dados exibidos podem estar desatualizados. Clique no botão 'buscar' e trabalhe com os dados mais atuais.
            </Alert>
        </Collapse>
    );
};

const Header = ({ titulo })  => {

    const history = useHistory();
    const dispatch = useDispatch();
    const [ nome ] = useState( JSON.parse(localStorage.getItem('dados')).Nome );

    const handleLogOut = () => {
        localStorage.clear();

        // Retorna o firstRefresh para true, para que a página principal possa ser recarregada ao atualizar
        dispatch( selData.firstRefresh( true ) );

        history.push('/LogIn');
    };

    const nomeEstiloso = {
        color: 'white',
        textAlign: 'end',
        paddingRight: '50px',
    };

    return(
        <div className="header-wrapper">
            <div className="title"> {titulo || 'STATUS DAS ENTREGAS'} </div>
            <div className="laranja">
                <div className="preto" style={nomeEstiloso} > { nome } </div>
                <img style={{ height: '35px', marginTop: 'auto'}} src={gerdau_logo} alt="gerdau" />
                <button onClick={handleLogOut} className='sair' > Sair </button>
            </div>

            <Alerta />

        </div>
    );
}

export default Header;