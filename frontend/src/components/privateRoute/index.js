import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router';
import { isAuthenticated } from '../../scripts/isAuthenticated';

const PrivateRoute = ({ component: Component, ...rest }) => {

    const [ render, setRender ] = useState();

    useEffect( () => {
        // Função que verifica se o usuário possui um token de authorização
        const mudaRender = async () => {
            const { isAuth } = await isAuthenticated();

            setRender(isAuth);
        };

        mudaRender();

    }, []);

    return(
        <> {(render !== undefined)?
            <Route
                {...rest}   
                render = { 
                        (props) =>
                            render
                                ?( <Component {...props}/> )
                                :( <Redirect to={{ pathname: '/LogIn', state: { from: props.location } }} /> )
                }
            />      
        :false} </>

    );
};

export default PrivateRoute;