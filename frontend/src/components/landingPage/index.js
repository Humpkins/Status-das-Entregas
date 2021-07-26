import React from 'react';
import './style.css';

import Header from '../general/Header';
import Form from '../general/date_form';
import Carregamento from '../general/Carregamento';

function Caminhoes() {

    return(
        <div className="landing_wrapper">
            <Header />
            <Form />
            <Carregamento />
        </div>
    );
};

export default Caminhoes;