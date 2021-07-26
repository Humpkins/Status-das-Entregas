import { agora } from "../../scripts/agora";

/* Verifica se foi salva uma danta anteriormente. Caso sim, o redux iniciará com essa data, do contrário
 ele usará a data de ontem */

const DATA_DEFAULT = {
    data: localStorage.getItem('Data') || new Date().toISOString().substring(0, 10),
    firstRefresh: true,
    lastRefresh: agora(),
};

const data = (state = DATA_DEFAULT, action) => {
    switch (action.type) {
        
        case 'SELECT_DATE':
            return {...state, data: action.data };

        case 'FIRST_REFRESH':
            return { ...state, firstRefresh: action.status };

        case 'LAST_REFRESH':
            return { ...state, lastRefresh: agora() }
            
        default:
            return state;
    }
}


export default data;