// Action para mudar os dados dos caminhões de descarregamento vindos das bases de dados do SAP
import api from '../../services/api';
import { agora } from '../../scripts/agora';

const evento_pos_pesagem_1 = process.env.REACT_APP_DESC_EVENTO_POS_PESAGEM_1;
const evento_pos_pesagem_2 = process.env.REACT_APP_DESC_EVENTO_POS_PESAGEM_2;

// Busca os dados da base do SAP
export const salvaDescarregamento = () => async ( dispatch ) => {
    
    dispatch( atualizaDescarregamento( true ) );

    const token = localStorage.getItem('token');
    const lstore_data = localStorage.getItem('Data');

    const agora_ = agora();

    const { Unidade: unidade } = JSON.parse( localStorage.getItem('dados') );

    const data = lstore_data || agora_.toString().slice(0, 8);

    if ( ![token, data, unidade].some(item => [ null, undefined ].includes(item))  ) {

        const body = {
            "data": data.replace(/-/g, '') || agora_.toString().slice(0, 8),
            unidade
        };

        const headers = {
            headers: { 'x-access-token': token }
        };

        const response = await api.post('/material', body, headers);
        try {
            
            const { data: { caminhoes } } = response;
            dispatch( { type: 'DES_FETCH_DESCARREGAMENTO', fechedData: caminhoes } );

        } catch (error) {
            alert( response.err );
            dispatch( { type: 'DES_FETCH_DESCARREGAMENTO', fechedData: [] } );
        };
    } else {
        dispatch( { type: 'DES_FETCH_DESCARREGAMENTO', fechedData: [] } );
    }

};

// Atualiza o status do caminhão selecionado no sqlite
export const atualizaDescarregamento = ( situacao ) => {
    return { type: 'DES_ATUALIZA_DESCARREGAMENTO', fechedData: situacao };
};

// Obtem todos os romaneios dentro do caminhao selecionado para ser exibido na tabela
export const selecionaDescarregamento = ( selecionado ) => {
    
    // Guarda o caminhão selecionado no localstorage
    const Obj_Selecionado = JSON.stringify( selecionado );
    localStorage.setItem( "Desc_selecionado", Obj_Selecionado );

    return { type: 'DES_SELECIONA_DESCARREGAMENTO', fechedData: selecionado };
};

// Observa as mudanças do input e filtra a lista de caminhões de carregamento
export const OnInput_change_filter = ( valorInput, caminhoes ) => {

    if ( valorInput !== "" ) {

        const filtrado = caminhoes.filter( item => JSON.stringify( item ).toLocaleLowerCase().includes( valorInput.toLocaleLowerCase() ) );

        return { type: 'DES_INPUT_CHANGE', fechedData: { input: valorInput, f_caminhoes: filtrado } };

    } else {
        return { type: 'DES_INPUT_CHANGE', fechedData: { input: valorInput, f_caminhoes: caminhoes } };
    }

};

// Atualiza status do caminhão
export const Status_change = async ( Status, { ID }, peso, token, dataHora ) => {

    const dados = localStorage.getItem('dados');

    try {
        
        const { Nome, Role, Email } = JSON.parse( dados );

        if ( Status === evento_pos_pesagem_1 ) {

            const corpo = {
                ID,
                Status,
                Role,
                tipo: 'descarregamento',
                Peso: peso,
                Comentario: '',
                Atualizado: dataHora,
                Atualizado_por: Nome,
                Email,
            };
    
            const headers = {
                headers: { 'x-access-token': token }
            };
    
            try {
                // Atualiza o status, o peso e data de entrada
                const response = await api.patch('/upd_descarregamento', corpo, headers);
                return response;
    
            } catch (error) {
                alert( error );
            };
    
        } else if ( Status === evento_pos_pesagem_2 ) {
    
            const corpo = {
                ID,
                Status,
                Role,
                tipo: 'descarregamento',
                Peso: peso,
                Comentario: '',
                Atualizado: dataHora,
                Atualizado_por: Nome,
                Email,
            };
    
            const headers = {
                headers: { 'x-access-token': token }
            };
    
            try {
                // Atualiza o status, o peso e data de entrada
                const response = await api.patch('/upd_descarregamento', corpo, headers);
                return response;
            } catch (error) {
                alert( error );
            };
    
        } else {
            
            const corpo = {
                ID,
                Status,
                Role,
                tipo: 'descarregamento',
                Peso: 0,
                Comentario: '',
                Atualizado: dataHora,
                Atualizado_por: Nome,
                Email,
            };
    
            const headers = {
                headers: { 'x-access-token': token }
            };
    
            try {
                // Atualiza o status, o peso e data de entrada
                const response = await api.patch('/upd_descarregamento', corpo, headers);
                return response;
            } catch (error) {
                alert( error );
            };
    
        };

    } catch (error) {
        alert('Houve um problema ao buscar os dados do usuário. Faça o login novamente e tente mais tarde.');
    }



};

// Atualiza status do caminhão no reducer
export const reducer_status_change = ( Status, { ID }, Peso ) => {

    return { type: 'DES_SPECIFIC_CHANGE', Status, ID, DataHora: agora(), Peso }
};

// Adiciona um comentario novo no reducer
export const reducer_add_coments = ( Comentario, ID ) => {
    
    const dados = localStorage.getItem('dados');
    if ( !dados ) { alert('Erro ao passar o comentario para o reducer. Faça o login e tente novamente'); return {}; }
    const { Nome: Usuario } = JSON.parse(dados);
    const Data = agora();

    const comentario = {
        Usuario,
        Comentario,
        Data
    };
    
    return { type: 'DES_ADD_COMENTS', ID, comentario }
};

// Adiciona um comentario novo ao banco de dados
export const server_add_coments = async ( Comentario, ID_caminhao ) => {

    const dados = localStorage.getItem('dados');
    const token = localStorage.getItem('token');
    if ( !dados ) alert('Usuario desconectado, faça o log in novamente')
    const { Nome: Usuario, Email } = JSON.parse(dados);

    const body = {
        Usuario,
        ID_caminhao,
        Comentario,
        Tipo: 'descarregamento',
        Email,
    };

    const headers = {
        headers: { 'x-access-token':  token }
    };

    const response = await api.post('/addComent', body, headers);
    if ( response.status !== 202 ) alert('Ocorreu um erro ao salvar o comentário!');

};

// Adiciona uma assinatura em um caminhao
export const reducer_add_assinaturas = ( ID ) => {

    const dados = localStorage.getItem('dados');
    if ( !dados ) { alert('Erro ao passar o comentario para o reducer. Faça o login e tente novamente'); return {}; }
    const { Email } = JSON.parse(dados);

    const Assinatura = {
        Email,
        Validade: agora() + 80000
    }

    return { type: 'DES_ADD_ASSINATURA', Assinatura, ID };

};

export const reducer_remove_assinaturas = ( ID ) => {

    const dados = localStorage.getItem('dados');
    if ( !dados ) alert('Usuario desconectado, faça o log in novamente');
    const { Email } = JSON.parse(dados);

    return { type: 'DES_REMOVE_ASSINATURA', Email, ID };

};

export const server_add_assinaturas = async ( ID ) => {

    const dados = localStorage.getItem('dados');
    const token = localStorage.getItem('token');
    if ( !dados ) alert('Usuario desconectado, faça o log in novamente');
    const { Email } = JSON.parse(dados);

    const body = {
        Email: encodeURI( Email ),
        tipo: 'descarregamento',
        ID,
    };

    const response = await api.post('assina', body, { headers: { 'x-access-token': token } } );
    if ( response.status !== 200 ) alert( response.data.err );

};

export const server_remove_assinaturas = async ( ID ) => {

    const dados = localStorage.getItem('dados');
    const token = localStorage.getItem('token');
    if ( !dados ) alert('Usuario desconectado, faça o log in novamente');
    const { Email } = JSON.parse(dados);

    const config = {
        headers: { 'x-access-token': token },
        params: {
            Email: encodeURI( Email ),
            tipo: 'descarregamento',
            ID
        },
    };

    const response = await api.delete('removeAssinatura', config );
    if ( response.status !== 200 ) alert( response.data.err );

};