import React from 'react';
import Header from '../general/Header';
import './style.css';
import InfoBox from './box';
import ComentsBox from '../general/comentarios';

export default function DetalheMP() {

    return(
        <div className="detalhe_mp_wrapper">
            <Header titulo="DETALHE MP"/>
            <div>
                <InfoBox />
                <ComentsBox tipo='descarregamento'/>
            </div>
        </div>
    );
}