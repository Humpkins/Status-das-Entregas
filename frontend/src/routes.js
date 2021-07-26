import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Caminhoes from './components/landingPage';
import DetalheCD from './components/DetalheCarregamento';
import DetalheMP from './components/DetalheMP';
import SignIn from './components/SignIn';
import LogIn from './components/LogIn';
import Test from './components/teste';
import PrivateRoute from './components/privateRoute';
import OhNoNoRole from './components/haveRole';

export default function Routes(){

    return(
        <BrowserRouter>
            <Switch>
                <Route          path = '/LogIn' component={LogIn} />
                <Route          path='/SignIn' component={SignIn} />
                <Route          path='/OhNoNoRole' component={OhNoNoRole} />

                <PrivateRoute   path='/' exact component={Caminhoes} />
                <PrivateRoute   path='/detalhe' component={DetalheCD} />
                <PrivateRoute   path='/descDetalhe' component={DetalheMP} />
                <PrivateRoute   path='/teste' component={Test} />
            </Switch>
        </BrowserRouter>
    );
}