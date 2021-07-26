// Ação para selecionar data
export const selecionaData = ( data ) => {
    
    // Guarda a data selecionada no localstorage
    localStorage.setItem('Data', data);

    return { type: 'SELECT_DATE', data }
};

// Ação para indicar que já houve a primeira atualização da página
export const firstRefresh = ( status ) => ({ type: 'FIRST_REFRESH', status });

// Ação para guardar a dataHora da ultima atualização
export const lastRefresh = () => ({ type: 'LAST_REFRESH' });