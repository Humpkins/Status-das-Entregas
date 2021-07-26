import api from '../services/api';

const validaStatusChange = async ( Status, ID, token, tipo ) => {

    const body = { Status, ID }

    const headers = { headers: { 'x-access-token': token } };

    if ( tipo === 'carregamento' ) {

        const url = '/validaMudancaStatusCarr';
        const response = await api.post(url, body, headers);

        return response;
    } else {

        const url = '/validaMudancaStatusDesc';
        const response = await api.post(url, body, headers);

        return response;
    };

};

export default validaStatusChange;