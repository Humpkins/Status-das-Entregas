import React from 'react';
import { useSelector } from 'react-redux';
import './style.css';

export default function Table({ colunas }){

    const { romaneios } = useSelector( state => state.carregamento );
    const { Dia } = useSelector( state => state.carregamento.carr_selecionado );

    // Formata a hora do formato YYYYMMSSHHmmSS em DD/MM/YYYY HH:mm:SS
    const formataDataHora = ( int_data )  => {
        
        const str_data = String(int_data);
        const f_str_data = str_data.replace(/^(\d{4})(\d{2})(\d{2})$/, "$3/$2/$1");
        return f_str_data;
    };    

    const alterna_cor = (id) => {
        if (id % 2 === 0) {
            return "rgba(56, 96, 178, 0.2)";
        } else {
            return "none"
        }
    };

    const CabecalhoLista = ({ item, n_items=2 }) => {
        const estilo = {
            height: '30px',
            background: 'rgba(56, 96, 178, 1)',
            color: 'white',
            width: `calc(100%/${n_items})`,
            textAlign: 'center',
            padding: '5px 0',
            border: 'solid black 1px'
        };

        return <div style={estilo} > { item } </div>
    };

    const LinhaLista = ({ linha }) => {

        const estilo = {
            background: alterna_cor(linha.id),
            height: '30px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            padding: '5px 0 '
        };
        
        return(
            <div style={{display: 'flex'}}>
                {
                    Object
                        .keys( linha )
                        .map( (key, index) =>
                            (key !== 'id')
                                ?( <div key={index} style={estilo} > { linha[key] } </div> )
                                :false
                        )
                }
            </div>
        )
    }

    return (
        <div className="div_wrapper">
            <span> Mapa: { formataDataHora(Dia) } </span>
            <div style={{maxHeight: '50vh', overflowY:'scroll'}}>
                <div className="cabecalho" style={{ position: 'sticky', top: 0, display: 'flex', width: '250px',}}>
                    { colunas && colunas.map( ( item, index ) => <CabecalhoLista key={index} item={item} /> ) }
                </div>
                <div className="corpo" style={{}}>
                    { romaneios && romaneios.map( ( item, index ) => <LinhaLista key={index} linha={item} />) }
                </div>
            </div>
        </div>
    );
}