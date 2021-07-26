import React from 'react';
import './style.css';
import { useDispatch, useSelector } from 'react-redux';

import * as act_carregamento from '../../../store/actions/carregamento';

export default function Detalhe_caminhao() {

    const dispatch = useDispatch();
    const { carr_selecionado } = useSelector( item => item.carregamento );

    // li dentro do ul de detalhes
    const DadosLi = ({ item }) => (
        <li onClick={ () => dispatch( act_carregamento.resume_romaneios_entrega( item ) ) }>
            <div className="cliente">
                <span> Cliente </span>
                <div> { item.Cliente } </div>
            </div>

            <div className="n_obra">
                <span> n° da obra </span>
                <div> { item.N_Obra } </div>
            </div>

            <div className="endereco">
                <span> Endereço </span>
                <div> { item.Endereco } </div>
            </div>
        </li>
    );

    return(
        <div className="detalhe_wrapper_2" onClick={ (e) => (e.target.className === 'detalhe_wrapper_2')? dispatch( act_carregamento.resume_romaneios_caminhao( carr_selecionado ) ) : false}>
            <div className="prioridade"> <h6> { carr_selecionado.Prioridade } </h6> </div>
            <ul className="dados" >
                { carr_selecionado.Entregas && carr_selecionado.Entregas.map( ( item, index ) => <DadosLi key={index} item={ item } /> ) }
            </ul>
        </div>
    );
}