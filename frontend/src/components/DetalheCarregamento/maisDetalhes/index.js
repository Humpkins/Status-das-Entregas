import React from 'react';
import {useSelector } from 'react-redux';

import './style.css';

export default function CarrEventos(){

    const{ carr_selecionado } = useSelector( state => state.carregamento );

    const reducer_peso = (anterior, atual) => {
        const peso_romaneios = atual.Romaneios.reduce((ant, at) => (ant + at.Peso), 0);

        return anterior + peso_romaneios;
    };

    // Formata a hora do formato YYYYMMSSHHmmSS em DD/MM/YYYY HH:mm
    const formataDataHora = ( int_data )  => {
        
        const str_data = String(int_data);
        const f_str_data = str_data.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$3/$2/$1 $4:$5");
        return f_str_data;
    };

    // Item da lista de eventos
    const LiEventos = ({ item, showLine = true }) => {

        const estilo_linha = {
            width: "1px",
            height: "60px",
            background: "black",
            alignItems: 'center'
        };

        const estilo_status_timeline = { 
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        };

        return (
            <li style={{ display:"flex", flexDirection: 'column', alignItems:'center' }}>
                {(showLine)?<div className="linha_vertical" style={estilo_linha}/>:false}
                <div className="status_timeline" style={estilo_status_timeline}>
                    <h3> { item.Status } </h3>
                    <span> { formataDataHora(item.DataHora) } </span>
                </div>
            </li>
        );
    };

    return(
        <div className="maisDetalhes">
            <div className="truck-info">
                <div className="info-header" >
                        <span> Informações </span>
                        <div />
                </div>
                
                <div className="info-valores">
                    <div className="esquerda">
                        <div className="chegada">
                            <h3> { (carr_selecionado.Chegada)?formataDataHora(carr_selecionado.Chegada):'-' } </h3>
                            <h6> Hora da hegada </h6>
                        </div>
                    </div>

                    <div className="direita">
                        <div className="saida" >
                            <h3> { (carr_selecionado.Saida)?formataDataHora(carr_selecionado.Saida):'-' } </h3>
                            <h6> Hora da saida </h6>
                        </div>
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
                        <h3> { carr_selecionado.Entregas && carr_selecionado.Entregas.reduce(reducer_peso, 0) } kg </h3>
                        <h6> Peso Arma+ </h6>
                    </div>
                    <div>
                        <h3> { carr_selecionado.Peso_chegada || '-'} kg </h3>
                        <h6> Peso na entrada </h6>
                    </div>
                    <div>
                        <h3> { carr_selecionado.Peso_saida || '-'} kg </h3>
                        <h6> Peso na saida </h6>
                    </div>
                </div>
            </div>

            <div className="eventos">
                <div className="info-header" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <span> Eventos </span>
                    <div />
                </div>
                
                {( carr_selecionado.h_status && carr_selecionado.h_status.length !== 0 )?
                    <ul>
                        { carr_selecionado.h_status && carr_selecionado.h_status.map( (item, index) =>  <LiEventos key={index} item={item} showLine={(index === 0)?false:true} />) }
                    </ul>:
                    false
                }
            </div>
        </div>
    );

}