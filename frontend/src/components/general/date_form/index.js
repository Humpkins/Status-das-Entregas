import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import './style.css';

import * as selData from '../../../store/actions/selData';
import { isAuthenticated } from '../../../scripts/isAuthenticated';
import * as act_carregamento from '../../../store/actions/carregamento';
import * as act_descarregamento from '../../../store/actions/descarregamento';
import { agora } from '../../../scripts/agora';

const MainForm = () => {

    const { caminhoes, atualizando: carr_atualizando } = useSelector( state => state.carregamento );
    const { caminhoes: des_caminhoes, atualizando: desc_atualizando  } = useSelector( state => state.descarregamento );
    const { data, firstRefresh } = useSelector( state => state.data);

    const history = useHistory();
    const dispatch = useDispatch();

    const [ dataf, setDataf ] = useState( data.slice(-2) );
    const [ mudancaData, setMudancaData ] = useState(false);

    // Atualiza ao abrir a página
    useEffect(() => {
        if (firstRefresh === true) {
            refresh_data();
            dispatch(selData.firstRefresh( false ));
        }
    // eslint-disable-next-line
    }, []);

    // Atualiza ao mudar o dia do datepicker
    useEffect(() => {
        if (firstRefresh === false && mudancaData === true ) {
            refresh_data();
        }
        
    // eslint-disable-next-line
    }, [dataf]);

    const filtraCaminhoes = ( e ) => {
        
        dispatch( act_descarregamento.OnInput_change_filter( e.target.value, des_caminhoes ) );
        dispatch( act_carregamento.OnInput_change_filter( e.target.value, caminhoes ) );
    };

    // Atualiza os dados de carregamento e descarregamento
    const refresh_data = async () => {

        // Verifica se está autenticado
        const { isAuth } = await isAuthenticated();

        if ( !isAuth ) {
            // Caso não esteja, mandar para a tela de logIn
            alert('Desconectado da seção. Faça o login e tente novamente!');
            history.push('/LogIn');
        } else {

            // Seta firstRefresh para false
            dispatch ( selData.firstRefresh( false ) );
    
            // Atualiza os caminhões de carregamento e descarregamento e indica que os dados já foram carregados
            dispatch ( act_carregamento.salvaCarregamento() );
            dispatch ( act_descarregamento.salvaDescarregamento() );

        }

    };

    // Data padrão do datepicker
    const data_default_datepicker = localStorage.getItem('Data') || agora().toString().slice(0, 8).replace(/^(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

    return (
        <div className="main_form_wrapper">
            
            <input
                type="search"
                onChange = {(e) => filtraCaminhoes( e )}
                placeholder="Placa, romaneio, status ou cliente"
            />
                
            <div className="data_input">
                <span> Data do mapa </span>
                <input type="date"
                    value={ data_default_datepicker }
                    onChange={ e => { dispatch( selData.selecionaData(e.target.value )); setDataf( e.target.value.slice(-2)); setMudancaData(true) } }
                    disabled={ ( carr_atualizando || desc_atualizando ) } />
            </div>

            <button
                onClick={ () => refresh_data() } 
                disabled={ ( carr_atualizando || desc_atualizando ) } > Buscar </button>
            
        </div>
    );
};

export default MainForm;