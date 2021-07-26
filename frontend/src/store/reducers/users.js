const USUARIO_INICIAL = {
    LogInStatus: false,
    //  Está autorizado e realizar mudanças de status
    isAuthe: true,
    // Está autenticado para navegar pelo site
    isAutho: true,
};

const user = ( state= USUARIO_INICIAL, action ) => {
    switch ( action.type ) {
        case 'ATUALIZA_STATUS_LOGIN':
            return { ...state, LogInStatus: action.status };

        case 'ATUALIZA_AUTHE':
            return { ...state, isAuth: action.authe };

        case 'ATUALIZA_AUTHO':
            return { ...state, isAut: action.autho };

        default:
            return state;
    };
};

export default user;