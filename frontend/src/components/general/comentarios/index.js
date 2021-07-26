import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './style.css';

import * as act_carregamento from '../../../store/actions/carregamento';
import * as act_descarregamento from '../../../store/actions/descarregamento';

import { intToDateTime } from '../../../scripts/agora';
import { FiSend } from 'react-icons/fi';
import { agora } from '../../../scripts/agora';
import { useEffect } from 'react';

const ComentsBox = ({ tipo }) => {

    const [ inp, setInp ] = useState('');

    const { ID: ID_carr, comentarios: comentarios_carr } = useSelector( state => state.carregamento.carr_selecionado );
    const { ID: ID_desc, comentarios: comentarios_desc } = useSelector( state => state.descarregamento.desc_selecionado );

    const [ comentarios, setComentarios ] = useState( (tipo === 'carregamento')?comentarios_carr:comentarios_desc );

    const dispatch = useDispatch();

    useEffect( () => {

        var texto = document.getElementById('entrada');
        texto.style.height = '38.5px'
        texto.style.height = ( texto.scrollHeight )+"px"
    });

    const adicionaComentLocal = ( Comentario ) => {

        const dados = localStorage.getItem('dados');
        const { Nome: Usuario } = JSON.parse( dados );
        const Data = agora();

        setComentarios( [ ...comentarios, { Data, Usuario, Comentario } ] );
    };

    const OrganizaArr = ( arr ) => {

        const sortFunc = ({ Data: a }, { Data: b }) => {
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        };

        const comentsOrganizado = arr.sort( sortFunc );

        return comentsOrganizado;
    };

    const ComentsLi = ({ item }) => {

        const { Usuario, Comentario, Data } = item;
        
        const h3_estiloso = {
            fontSize: '0.7rem'
        };

        const span_estiloso = {
            fontSize: '0.5rem'
        };

        return(
            <li>
                <h3 style={h3_estiloso}> {Usuario} </h3> <span style={span_estiloso}> { intToDateTime( Data ).toLocaleDateString() + ' ' + intToDateTime( Data ).toLocaleTimeString() } </span>
                <div> { Comentario } </div>
            </li>
        );
    };

    const comitComent = async (e) => {

        e.preventDefault();

        if ( tipo === 'carregamento' ){
            // Manda pro DB
            act_carregamento.server_add_coments( inp, ID_carr );

            // Manda para o redux-store
            dispatch( act_carregamento.reducer_add_coments( inp, ID_carr ) );

        } else if ( tipo === 'descarregamento' ) {
            // Manda pro DB
            act_descarregamento.server_add_coments( inp, ID_desc );

            // Manda para o redux-store
            dispatch( act_descarregamento.reducer_add_coments( inp, ID_desc ) );

        } else {

            alert('Ocorreu um erro ao tentar enviar o comentário para o servidor. Faça o login novamente');

        }

        adicionaComentLocal( inp );

        setInp('');
    };

    return(
        <div className="comentsBox-wrapper">
            <h1 style={{height: '50px'}}> Comentários </h1>

            { comentarios && ( comentarios.length !== 0 )?
                <ul id='ul_comentarios'>
                    {( comentarios && OrganizaArr( comentarios ).map( (item, index) => <ComentsLi key={index} item={item} /> ) )}
                </ul>:
                <h3> Seja o primeiro a comentar </h3>
            }

            <div className="inputWrapper">
                <textarea id={'entrada'} value={inp} onChange={ e => setInp( e.target.value ) } type="text" /> 
                <button onClick={ e => comitComent(e) } > <FiSend size={15} /> </button>
            </div>
        </div>
    );
};

export default ComentsBox;