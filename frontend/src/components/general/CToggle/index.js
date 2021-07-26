import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { agora } from '../../../scripts/agora';

import * as act_carregamento from '../../../store/actions/carregamento';
import * as act_descarregamento from '../../../store/actions/descarregamento';

import Toggle from 'react-toggle';
import "react-toggle/style.css";

import './style.css';


export default function CToggle({ tipo }){

    const { ID: carr_ID, Assinaturas: carr_Assinaturas } = useSelector( state => state.carregamento.carr_selecionado );
    const { ID: desc_ID, Assinaturas: desc_Assinaturas } = useSelector( state => state.descarregamento.desc_selecionado );

    const dispatch = useDispatch();

    const setDefault = () => {

        const verificaAssinatura = ( Assinaturas ) => {

            const dados = localStorage.getItem('dados');
            if ( !dados ) alert('Ocorreu um problema com os dados de usuário. Refaça o login e tente novamente.');
            const { Email } = JSON.parse(dados);

            const assinado = Assinaturas.some( item => ( item.Email === Email && agora() <= item.Validade ) );

            return assinado;

        };

        if ( tipo === 'carregamento' ) return verificaAssinatura( carr_Assinaturas );
        else if ( tipo === 'descarregamento' ) return verificaAssinatura( desc_Assinaturas );
        else alert('Ocorreu um problema no seviço de Assinaturas. Refaça o login e tente novamente.');

    };

    const [ defaultToggle ] = useState(setDefault());

    const handleToggle = (e) => {

        if ( tipo === 'carregamento' ) {

            if ( e.target.checked === true ) {
                act_carregamento.server_add_assinaturas( carr_ID );
                dispatch( act_carregamento.reducer_add_assinaturas( carr_ID ) );
            } else {
                act_carregamento.server_remove_assinaturas( carr_ID );
                dispatch( act_carregamento.reducer_remove_assinaturas( carr_ID ) );
            };

        } else if ( tipo === 'descarregamento' ) {

            if ( e.target.checked === true ) {
                act_descarregamento.server_add_assinaturas( desc_ID );
                dispatch( act_descarregamento.reducer_add_assinaturas( desc_ID ) );
            } else {
                act_descarregamento.server_remove_assinaturas( desc_ID );
                dispatch( act_descarregamento.reducer_remove_assinaturas( desc_ID ) );
            };
        } else alert('Ocorreu um problema no serviço de assinatura, refaça o login e tente novamente.');

    };

    return(
        <div style={{
            display:'flex',
            flexDirection:'column',
            alignItems: 'center',
            height: '100%'}}>

            <h6> Assinar caminhao </h6>
            <Toggle onChange={handleToggle} defaultChecked={defaultToggle} />

        </div>
    );
}