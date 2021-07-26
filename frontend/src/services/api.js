import axios from 'axios';

const api = axios.create({
    baseURL: 'http://10.59.92.115:3333',
    validateStatus: null,
});

export default api;