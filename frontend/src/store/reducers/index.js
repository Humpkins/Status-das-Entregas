import { combineReducers } from 'redux';

import carregamento from './carregamento';
import descarregamento from './descarregamento';
import data from './data';
import toggle_tipo_carrga from './toggleCarr_Descarr';

export default combineReducers({
    carregamento,
    descarregamento,
    toggle_tipo_carrga,
    data,
});