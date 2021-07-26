const VALOR_TOGGLE = { estado: true };

const toggle_tipo_carrga = ( state = VALOR_TOGGLE, action ) => {
    switch ( action.type ) {
        case 'TOGGLE':
            return { estado: action.estado };
        default:
            return state;
    }
}

export default toggle_tipo_carrga;