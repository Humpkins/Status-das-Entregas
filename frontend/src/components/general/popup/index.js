import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import './style.css';

import * as act_carregamento from '../../../store/actions/carregamento';
import * as act_descarregamento from '../../../store/actions/descarregamento';

export default function PopUp({ texto, status, func_visivel, ID, tipo, atualizado, btnDisplay, setDisableBtn }){

    const history = useHistory();

    const dispatch = useDispatch();
    const [vinput, setVinput] = useState(parseInt(''));

    // Função para validar a entrada do usuário
    const valida = async ( peso ) => {
        try {
            
            // verifica se tem 4 dígitos no mínimo
            if ( peso.toString().length < 4 ) {
                // Numero com menos de 4 caracteres
                return 1;
            } else {
                // tudo ok com o valor inserido
                return 0;
            };

        } catch (error) {
            // peso foi deixado em branco ou é inválido
            return 2;
        }


    };

    // Envia os dados caso  seja preciso inserir o peso do caminhão
    const submit_form = async (e) => {
        e.preventDefault();

        setDisableBtn(true);

        const codigo = await valida( vinput );
        if ( codigo === 1 ){
            setDisableBtn(false);
            alert( 'Erro ao validar o dado. O peso inserido deve ser em Kg' );
            return;
        } else if ( codigo === 2 ){
            alert( 'Erro ao validar o dado. Nenhum valor foi inserido ou o valor é inválido' );
            setDisableBtn(false);
            return;
        } else {
            const token = localStorage.getItem('token');

            if ( tipo === 'carregamento' ) {

                const response = await act_carregamento.Status_change( status, { ID }, vinput, token, atualizado );
                if ( response.status === 200 ) {

                    dispatch( act_carregamento.reducer_status_change( status, { ID }, vinput ) );
                    history.push('/');
                    
                } else {
                    alert( response.data.err );
                };

            } else if ( tipo === 'descarregamento' ) {
                
                const response = await act_descarregamento.Status_change( status, { ID }, vinput, token, atualizado );
                if ( response.status === 200 ) {

                    dispatch( act_descarregamento.reducer_status_change( status, { ID }, vinput ) );
                    history.push('/');

                } else {
                    alert( response.data.err );
                };
                
            };
            
            setDisableBtn(false);

            func_visivel(false);

        };
    };

    return(
        <div className="pop_carregamento">
            <form onSubmit={e => submit_form(e)} >
                <h3> { texto || "Texto placeholder" }</h3>
                <input
                    value ={vinput}
                    onChange={e => setVinput(e.target.value)}
                    type="number"
                    placeholder="peso em kg"
                />

                <div className="botoes">
                    <button onClick={() => func_visivel(false)} disabled={btnDisplay}> Cancelar </button>
                    <button type="submit" disabled={btnDisplay}> Enviar </button>
                </div>
            </form>
        </div>
    );
}