import api from '../../services/api';
import { agora } from '../../scripts/agora';

const evento_pos_pesagem_1 = process.env.REACT_APP_CARR_EVENTO_POS_PESAGEM_1;
const evento_pos_pesagem_2 = process.env.REACT_APP_CARR_EVENTO_POS_PESAGEM_2;

// Action para mudar os dados dos caminhões de carregamento vindos das bases de dados do Arma+
export const salvaCarregamento = () => async ( dispatch ) => {
    
    dispatch( atualizaCarregamento( true ) );

    const token = localStorage.getItem('token');
    const lstore_data = localStorage.getItem('Data');

    const agora_ = agora();

    const { Unidade: unidade } = JSON.parse( localStorage.getItem('dados') );

    const data = lstore_data || agora_.toString().slice(0, 8);

    if ( ![token, data, unidade].some(item => [ null, undefined ].includes(item)) ) {

        const body = {
            "data": data.replace(/-/g, ''),
            unidade,
        };

        const headers = {
            headers: { 'x-access-token': token },
        };
            
        const response = await api.post('/mapa', body, headers);

        try {

            const { data: { caminhoes } } = response;

            dispatch( { type: 'CAR_FETCH_CARREGAMENTO', fechedData: caminhoes } );

        } catch (error) {

            alert(response.err);
            dispatch( { type: 'CAR_FETCH_CARREGAMENTO', fechedData: [] } );
        };

    } else {
        dispatch( { type: 'CAR_FETCH_CARREGAMENTO', fechedData: [] } );
    };
};

export const atualizaCarregamento = ( situacao ) => {
    return { type: 'CAR_ATUALIZA_CARREGAMENTO', fechedData: situacao };
};

// Obtem todos os romaneios dentro do caminhao selecionado para ser exibido na tabela
export const selecionaCarregamento = ( selecionado ) => {
    
    // Guarda o caminhão selecionado no localstorage
    const Obj_Selecionado = JSON.stringify( selecionado );
    localStorage.setItem( "Selecionado", Obj_Selecionado );

    return { type: 'CAR_SELECIONA_CARREGAMENTO', fechedData: selecionado };
};

// Obtem todos os romaneios dentro de uma entrega do caminhão selecionado para ser exibido na tabela
export const resume_romaneios_entrega = ( entrega ) => {
    let index = 0;
    let romaneios = [];

    for ( let y = 0; y < entrega.Romaneios.length; y++ ) {

        const romaneio = {
            Romaneio: entrega.Romaneios[y]['Romaneio'],
            Peso: entrega.Romaneios[y]['Peso'],
            id: index
        }

        romaneios.push( romaneio );
        index++;
    };

    return { type: 'CAR_SALVA_ROMANEIOS', fechedData: romaneios };
};

// Obtem todos os romaneios dentro do caminhao selecionado para ser exibido na tabela
export const resume_romaneios_caminhao = ( caminhao ) => {

    let index = 0;
    let romaneios = [];

    for ( let i = 0; i < caminhao.Entregas.length; i++ ) {
        for ( let y = 0; y < caminhao.Entregas[i].Romaneios.length; y++ ) {

            const romaneio = {
                Romaneio: caminhao.Entregas[i].Romaneios[y]['Romaneio'],
                Peso: caminhao.Entregas[i].Romaneios[y]['Peso'],
                id: index
            }

            romaneios.push( romaneio );
            index++;
        };
    };

    return { type: 'CAR_SALVA_ROMANEIOS', fechedData: romaneios };
};

// Observa as mudanças do input e filtra a lista de caminhões de carregamento
export const OnInput_change_filter = ( valorInput, caminhoes ) => {

    if ( valorInput !== "" ) {

        const filtrado = caminhoes.filter( item => JSON.stringify( item ).toLocaleLowerCase().includes( valorInput.toLocaleLowerCase() ) );

        return { type: 'CAR_INPUT_CHANGE', fechedData: { input: valorInput, f_caminhoes: filtrado } };

    } else {
        return { type: 'CAR_INPUT_CHANGE', fechedData: { input: valorInput, f_caminhoes: caminhoes } };
    }

};

// Atualiza status do caminhão na base de dados
export const Status_change = async ( Status, { ID }, peso, token, dataHora ) => {

    const dados =  localStorage.getItem('dados');
    try {
        const { Nome, Role, Email } = JSON.parse( dados );
    
        if ( Status === evento_pos_pesagem_1 ) {

            const corpo = {
                ID,
                Status,
                Role,
                tipo: 'carregamento',
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
                const response = await api.patch('/upd_carregamento', corpo, headers);
                return response;

            } catch (error) {
                alert( error );
            };

        } else if ( Status === evento_pos_pesagem_2 ) {

            const corpo = {
                ID,
                Status,
                Role,
                tipo: 'carregamento',
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

                // Atualiza o status, o peso e data de saída
                const response = await api.patch('/upd_carregamento', corpo, headers);
                return response;

            } catch (error) {
                alert( error )
            };

        } else {
            
            const corpo = {
                ID,
                Status,
                Role,
                tipo: 'carregamento',
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

                // Atualiza o status
                const response = await api.patch('/upd_carregamento', corpo, headers);
                return response;

            } catch (error) {
                alert(error);
            };

        };

    } catch (error) {
        alert('Houve um problema ao buscar os dados do usuário. Faça o login novamente e tente mais tarde!');
    };

};

// Atualiza status do caminhão no reducer
export const reducer_status_change = ( Status, { ID }, Peso ) => {
    const agora = () => {
        const data = new Date();

        const mes = (data.getMonth()+1).toString().padStart(2, '0');
        const dia = data.getDate().toString().padStart(2, '0');
        const ano = data.getFullYear();
        const hora = data.getHours().toString().padStart(2, '0');
        const minuto = data.getMinutes().toString().padStart(2, '0');
        const segundo = data.getSeconds().toString().padStart(2, '0');
        
        const agora = parseInt(ano + mes + dia + hora + minuto + segundo)
        
        return agora;
    };

    return { type: 'CAR_SPECIFIC_CHANGE', Status, ID, DataHora: agora(), Peso };
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

    return { type: 'CAR_ADD_COMENTS', ID, comentario }
};

// Adiciona um comentario novo ao banco de dados
export const server_add_coments = async ( Comentario, ID_caminhao ) => {

    const token = localStorage.getItem('token');
    const dados = localStorage.getItem('dados');
    if ( !dados ) { alert('Usuario desconectado, faça o log in novamente'); return }
    const { Nome: Usuario, Email } = JSON.parse(dados);

    const body = {
        Usuario,
        ID_caminhao,
        Comentario,
        Tipo: 'carregamento',
        Email,
    };

    const headers = {
        headers: { 'x-access-token':  token }
    };

    const response = await api.post('/addComent', body, headers);
    if ( response.status !== 202 ) {
        alert('Ocorreu um erro ao salvar o comentário!');
        console.log( response );
    }

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

    return { type: 'CAR_ADD_ASSINATURA', Assinatura, ID };

};

export const reducer_remove_assinaturas = ( ID ) => {

    const dados = localStorage.getItem('dados');
    if ( !dados ) alert('Usuario desconectado, faça o log in novamente');
    const { Email } = JSON.parse(dados);

    return { type: 'CAR_REMOVE_ASSINATURA', Email, ID };

};

export const server_add_assinaturas = async ( ID ) => {

    const dados = localStorage.getItem('dados');
    const token = localStorage.getItem('token');
    if ( !dados ) alert('Usuario desconectado, faça o log in novamente');
    const { Email } = JSON.parse(dados);

    const body = {
        Email: encodeURI( Email ),
        tipo: 'carregamento',
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
            tipo: 'carregamento',
            ID
        },
    };

    const response = await api.delete('removeAssinatura', config );
    if ( response.status !== 200 ) alert( response.data.err );

};