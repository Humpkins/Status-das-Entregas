import { agora } from '../../scripts/agora';

// Reducer para guardar os dados dos caminhões de carregamento
const CARREGAMENTO_INICIAL = {
    atualizado: agora(),
    atualizando: false,
    caminhoes: [],
    filtro_caminhoes: {
        input: "",
        f_caminhoes: []
    },
    carr_selecionado: {},
    romaneios: [],
};

const evento_pos_pesagem_1 = process.env.REACT_APP_CARR_EVENTO_POS_PESAGEM_1;
const evento_pos_pesagem_2 = process.env.REACT_APP_CARR_EVENTO_POS_PESAGEM_2;
const evento_veiculo_chegou = process.env.REACT_APP_CARR_EVENTO_CHEGADA_UNIDADE;
const evento_veiculo_liberado = process.env.REACT_APP_CARR_EVENTO_SAIDA_UNIDADE;

const carregamento = ( state = CARREGAMENTO_INICIAL, action ) => {
    switch ( action.type ) {
        case 'CAR_FETCH_CARREGAMENTO':
            return { ...state, caminhoes: action.fechedData, atualizando: false, atualizado: agora() };

        case 'CAR_ATUALIZA_CARREGAMENTO':
            return { ...state, atualizando: action.fechedData };

        case 'CAR_SELECIONA_CARREGAMENTO':
            return { ...state, carr_selecionado: action.fechedData };

        case 'CAR_SALVA_ROMANEIOS':
            return { ...state, romaneios: action.fechedData };

        case 'CAR_INPUT_CHANGE':
            return { ...state, filtro_caminhoes: action.fechedData };

        case 'CAR_ADD_COMENTS':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) =>
                    ( content.ID === action.ID )?{  ...content,
                                                    comentarios: [ ...content.comentarios, action.comentario ]
                                                    }:content ),
            };

        case 'CAR_SPECIFIC_CHANGE':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) => 
                    ( content.ID === action.ID )?{  ...content,
                                                    Status: action.Status,
                                                    Chegada: (action.Status === evento_veiculo_chegou || ( action.Status !== evento_veiculo_chegou && [null, undefined].includes(content.Chegada) ) )?action.DataHora:content.Chegada,
                                                    Saida: (action.Status === evento_veiculo_liberado )?action.DataHora:content.Saida,
                                                    Peso_chegada: ( action.Status === evento_pos_pesagem_1)?action.Peso:content.Peso_chegada,
                                                    Peso_saida: ( action.Status === evento_pos_pesagem_2)?action.Peso:content.Peso_saida,
                                                    h_status: [ ...content.h_status, { Status: action.Status, DataHora: action.DataHora, Comentario: ''} ],
                                                    Atualizado: agora(),
                                                }:content
                ),
            };

        case 'CAR_ADD_ASSINATURA':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) =>
                    ( content.ID === action.ID )?{  ...content,
                                                    Assinaturas: [ ...content.Assinaturas, action.Assinatura ]
                                                    }:content ),
            };

        case 'CAR_REMOVE_ASSINATURA':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) =>
                    ( content.ID === action.ID )?{  ...content,
                                                    Assinaturas: content.Assinaturas.filter( item => item.Email !== action.Email ),
                                                    }:content ),
            };

        default:
            return state;
    }
};

export default carregamento;