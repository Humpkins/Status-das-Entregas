import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import './style.css';

import CarregamentoLi from './carregamento_li';
import MpLi from './mp_li';

import * as toggle from '../../../store/actions/toggleCarr_Descar';

export default function Carregamento(){

    const dispatch = useDispatch();

    // Informações de carregamento ( caminhões & indicador se está carregando dados ou n )
    const { caminhoes, atualizando } = useSelector( state => state.carregamento );

    // Informações de descarregamento ( caminhões & indicador se está carregando dados ou n )
    const caminhoes_desc = useSelector( state => state.descarregamento.caminhoes );
    const atualizando_desc = useSelector( state => state.descarregamento.atualizando );

    // Tipo de carga selecionada
    const { estado } = useSelector( state => state.toggle_tipo_carrga );

    return(
        <div className="wrapper" >
            <div className="buttons">
                
                <button
                    onClick = {() => dispatch( toggle.toggle_tipo_carrga( (!estado)?true:false ) )}
                    className="botao_toggle"
                    style={{ background: "#E3F1FF" }}
                >
                        Carregamento ({ (atualizando)?"...":(caminhoes)?caminhoes.length:0 })
                </button >
                <button
                    onClick = {() => dispatch( toggle.toggle_tipo_carrga( (estado)?(false):false ) )}
                    className="botao_toggle"
                    style={{ background: "#333F4F", color: "white" }}
                >
                        Materia prima ({ (atualizando_desc)?"...":(caminhoes_desc)?caminhoes_desc.length:0 })
                </button >
            </div>

            {   (estado)?
                <CarregamentoLi />:
                <MpLi />
            }

        </div>
    );
}