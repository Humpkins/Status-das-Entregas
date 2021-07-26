import React from 'react';


export default function OhNoNoRole(){
    return(
        <div className="no_role">
            <h1> Ops! </h1>
            <br/>
            <h2> Aparentemente você ainda não possui uma role definida, solicite uma com o { process.env.REACT_APP_CONTATO_MANUTENCAO } e tente novamente mais tarde</h2>
        </div>
    );
};