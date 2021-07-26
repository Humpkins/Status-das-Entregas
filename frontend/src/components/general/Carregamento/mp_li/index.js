import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import './style.css';
import { FiCheck } from 'react-icons/fi';

import * as act_descarregamento from '../../../../store/actions/descarregamento';

import Loading from '../../loadingSklt';

export default function MpLi(){
    const dispatch = useDispatch();

    const status_veiculo_liberado = process.env.REACT_APP_DESC_EVENTO_SAIDA_UNIDADE;

    const { caminhoes, atualizando, filtro_caminhoes:{ input, f_caminhoes } } = useSelector( state => state.descarregamento );

    // Formata a hora do formato YYYYMMSSHHmmSS em DD/MM/YYYY HH:mm:SS
    const formataDataHora = ( int_data )  => {
        
        const str_data = String(int_data);
        const f_str_data = str_data.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$3/$2/$1 $4:$5:$6");
        return f_str_data;
    };

    const Li = ({ caminhao }) => {

        const selecionaCaminhao = async ( selecionado ) => {

            dispatch( act_descarregamento.selecionaDescarregamento( selecionado ) );
        };
        
        const stilo_check = {
            background: 'rgba(54, 176, 75, 1)',
            display: (caminhao && caminhao.Status === status_veiculo_liberado )?'block':'none'
        };

        return(
            <li>

                <Link
                    to="/descDetalhe"
                    className="chevrom"
                    style={{ border: 'none', background: 'none', color: 'white'}}
                    onClick={ () => selecionaCaminhao( caminhao ) }
                >

                    <div className="placa-liberado">
                        <h3> Placa: { ( caminhao.Placa.match(/([A-Z]{3}[0-9][0-9A-Z][0-9]{2})/) )?caminhao.Placa.match(/([A-Z]{3}[0-9][0-9A-Z][0-9]{2})/)[0]:caminhao.Placa } </h3>
                        <button style={stilo_check}> <FiCheck size={30} color="white"/> </button>
                    </div>

                    <span className="chegada"> { caminhao.Materiais && caminhao.Materiais[0].Material } </span>

                    <div className="info">
                        <span> Status do veículo: { caminhao.Status } </span>
                        { caminhao.Chegada && <span> Data de chegada: { formataDataHora(caminhao.Chegada) } </span> }
                        { caminhao.Saida && <span> Data de saída: { formataDataHora(caminhao.Saida) } </span>}
                    </div>

                    <div className="bottom_line" />

                </Link>
            </li>
        );
    } 

    return (
        (atualizando)?
        <Loading tipo='descarregamento' />:
        <ul className="mp_wrapper">
            { (input === "")
                ?caminhoes && caminhoes.map( item => <Li key={item.ID} caminhao ={item} /> )
                :f_caminhoes && f_caminhoes.map( item => <Li key={item.ID} caminhao ={item} />)
            }
        </ul>
    )
}