import api from '../services/api';

export const isAuthenticated = async () => {

    const token = localStorage.getItem('token');
    const dados = JSON.parse( localStorage.getItem('dados') );

    if ( !dados || !token ) {
        return {isAuth: false, token};
    } else {
        const config = {
            headers: { 'x-access-token': token },
            params: { Email: encodeURI( dados.Email )},
        };

        const { data: { auth } } = await api.get('verifyJWT', config );

        if ( !auth ) {
            return {isAuth: false, token};;
        } else {
            return {isAuth: true, token};;
        }
    }
};