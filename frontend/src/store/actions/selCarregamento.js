// Action para alterar os dados do caminhão de carregamento selecionado

export const seleciona_carregamento = ( selecionado ) => {
    return { type: 'SET_CARREGAMENTO', selecionado }
}