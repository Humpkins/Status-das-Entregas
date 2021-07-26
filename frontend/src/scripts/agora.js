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

const intToDateTime = ( data_int ) => {
  
    const data_str = data_int.toString();
    
    const year = data_str.substring(0,4);
    const month = data_str.substring(4,6);
    const day = data_str.substring(6,8);
    
    const hour = data_str.substring(8, 10);
    const minute = data_str.substring(10, 12);
    const second = data_str.substring(12, 14);
    
    const date = new Date(year, month-1, day, hour, minute, second);
    
    return date;
      
};

export { agora, intToDateTime };