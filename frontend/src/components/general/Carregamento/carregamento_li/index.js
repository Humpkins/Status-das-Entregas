import React from 'react';
import './style.css';

import { FiCheck, FiMail } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import * as act_carregamento from '../../../../store/actions/carregamento';

import Loading from '../../loadingSklt';


export default function CarregamentoLi() {

    const status_veiculo_liberado = process.env.REACT_APP_CARR_EVENTO_SAIDA_UNIDADE;

    const { caminhoes, atualizando, filtro_caminhoes:{ input, f_caminhoes } } = useSelector( state => state.carregamento );
    const dispatch = useDispatch();

    const selecionaCaminhao = async ( selecionado ) => {

        dispatch( act_carregamento.selecionaCarregamento( selecionado ) );
        
        dispatch( act_carregamento.resume_romaneios_caminhao( selecionado ) );

    };

    const stilo_alertas = {
        background: "blue",
        display: "none",
    };

    const stilo_ul = {
        background: "#E3F1FF",
        width: "100%",

        borderRadius: "0 20px 0 0",
    };

    const Li = ({ caminhao, id }) => {

        const reducer = (anterior, atual) => {
            const peso_romaneios = atual.Romaneios.reduce((ant, at) => (ant + at.Peso), 0);

            return anterior + peso_romaneios;
        }

        const stilo_check = {
            background: 'rgba(54, 176, 75, 1)',
            color: 'white',
            boxShadow: '0 2px 5px 1px rgb(64 60 67 / 16%)',
            display: (caminhao.Status === status_veiculo_liberado )?'block':'none',
        }

        const link_estiloso = {
        border: 'none',
        color: 'black',
        background: 'none',

    }

        return(
            <li>
                <Link
                    to="/detalhe" style={link_estiloso}
                    onClick={ () => selecionaCaminhao( caminhao ) }
                >

                    <div className="placa-icons">
                        <h3 style={{padding: "10px 0"}}> Placa: { caminhao.Placa } </h3>
                        <div className="icons">
                            <button style={stilo_check} className="check"> <FiCheck size={30}/> </button>
                            <button style={stilo_alertas} className="email"> <FiMail size={30}/> </button>
                        </div>
                    </div>

                    <div className="info">
                        <div>
                            <span> Status: { caminhao.Status } </span>
                            <span> Peso: { caminhao.Entregas && caminhao.Entregas.reduce(reducer, 0) } kg </span>
                            <span> Mapa: { caminhao.Dia && caminhao.Dia.replace(/(\d{4})(\d{2})(\d{2})/g, '$3/$2/$1') } </span>
                        </div>

                        <div>
                            <h3> { caminhao.Prioridade } </h3>
                            <h6> Prioridade </h6>
                        </div>
                    </div>

                    <div className="bottom_line" />

                </Link>    
            </li>
        );
    }

    return ( 
        (atualizando)?
            <Loading tipo='carregamento' />:
            <ul className="carregamento_wrapper" style={stilo_ul}>

                { (input === "")
                    ?caminhoes && caminhoes.map( item => <Li key={item.ID} caminhao ={item} /> )
                    :f_caminhoes && f_caminhoes.map( item => <Li key={item.ID} caminhao ={item} />)
                }
                
            </ul>
    )
}