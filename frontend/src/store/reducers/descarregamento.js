import { agora } from '../../scripts/agora';

// Reducer para guardar os dados dos caminhões de descarregamento

const DESCARREGAMENTO_INICIAL = {
    atualizado: agora(),
    atualizando: false,
    caminhoes: [],
    filtro_caminhoes: {
        input: "",
        f_caminhoes: []
    },
    desc_selecionado: {},
};

const evento_pos_pesagem_1 = process.env.REACT_APP_DESC_EVENTO_POS_PESAGEM_1;
const evento_pos_pesagem_2 = process.env.REACT_APP_DESC_EVENTO_POS_PESAGEM_2;
const evento_veiculo_chegou = process.env.REACT_APP_DESC_EVENTO_CHEGADA_UNIDADE;
const evento_veiculo_liberado = process.env.REACT_APP_DESC_EVENTO_SAIDA_UNIDADE;

const descarregamento = ( state = DESCARREGAMENTO_INICIAL, action ) => {
    switch ( action.type ) {
        case 'DES_FETCH_DESCARREGAMENTO':
            return { ...state, caminhoes: action.fechedData, atualizando: false, atualizado: agora() };

        case 'DES_ATUALIZA_DESCARREGAMENTO':
            return { ...state, atualizando: action.fechedData };

        case 'DES_SELECIONA_DESCARREGAMENTO':
            return { ...state, desc_selecionado: action.fechedData };

        case 'DES_INPUT_CHANGE':
            return{ ...state, filtro_caminhoes: action.fechedData };

        case 'DES_SPECIFIC_CHANGE':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) => 
                    ( content.ID === action.ID )?{  ...content,
                                                    Status: action.Status,
                                                    Chegada: (action.Status === evento_veiculo_chegou || ( action.Status !== evento_veiculo_chegou && [null, undefined].includes(content.Chegada) ) )?action.DataHora:content.Chegada,
                                                    Saida: (action.Status === evento_veiculo_liberado )?action.DataHora:content.Saida,
                                                    Peso_chegada: ( action.Status === evento_pos_pesagem_1 )?action.Peso:content.Peso_chegada,
                                                    Peso_saida: ( action.Status === evento_pos_pesagem_2 )?action.Peso:content.Peso_saida,
                                                    h_status: [ ...content.h_status, { Status: action.Status, DataHora: action.DataHora, Comentario: ''} ],
                                                    Atualizado: agora(),
                                                }:content
                ),
            };

        case 'DES_ADD_COMENTS':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) =>
                    ( content.ID === action.ID )?{  ...content,
                                                    comentarios: [ ...content.comentarios, action.comentario ]
                                                    }:content ),
            };

        case 'DES_ADD_ASSINATURA':
            return {
                ...state,
                caminhoes: state.caminhoes.map( (content) =>
                    ( content.ID === action.ID )?{  ...content,
                                                    Assinaturas: [ ...content.Assinaturas, action.Assinatura ]
                                                    }:content ),
            };

        case 'DES_REMOVE_ASSINATURA':
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
}

export default descarregamento;