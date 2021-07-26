import { GoogleMap, Polyline, LoadScript, Marker } from '@react-google-maps/api';
// const ScriptLoaded = require("../../../../node_modules/@react-google-maps/api/src/ScriptLoaded").default;
import { useEffect, useState } from 'react';
import api from '../../../services/api';

export default function Map({ rota }){

    const key = process.env.REACT_APP_KEY_GOOGLE_MAPS;

    const [ rorap, setRotap ] = useState();
    const [ center, setCenter ] = useState();
    const [ enderecos, setEnderecos ] = useState();
    const [ origem, setOrigem] = useState();
    
    useEffect(() => {

        // eslint-disable-next-line
        const fetchLocalizacao = async () => {

            const token = localStorage.getItem('token');
            const dados = localStorage.getItem('dados'); 

            if ( ![ token, dados ].some( item => [ undefined, null ].includes(item) ) ) {

                const { Unidade } = JSON.parse(dados);

                console.log(Unidade);

                const config = {
                    headers: { 'x-access-token': token },
                    params: { Unidade },
                };

                const response = await api.get( '/endereco', config );

                if ( response.status === 200 ) {

                    const { data: { Endereco: Origem } } = response;

                    const rota_option = {
                        Origem,
                        Entregas: rota
                    };

                    const headers = {
                        headers: { 'x-access-token': token },
                    };

                    console.log( rota_option );

                    const { data: { polyline, lat_center_0, lng_center_0, origem, enderecos } } = await api.post('rota', rota_option, headers);
        
                    setOrigem(origem);
                    setEnderecos(enderecos);
                    setRotap(polyline);
                    setCenter({ lat: lat_center_0, lng: lng_center_0 });
                };
            };

        };

        fetchLocalizacao();

    }, [rota] );

    const mapContainerStyle = {
        height: "300px",
        width: "600px",
        border: "solid black 1px"
    };
      
    const options = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        radius: 30000,
        paths: rorap,
        zIndex: 1,
    };

    return(
        <LoadScript googleMapsApiKey={key} >
            <GoogleMap
                id="marker-example"
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={center}
            >
                {   rorap &&
                    <Polyline
                        path={rorap}
                        options={options}
                    />
                }
                {   
                    enderecos &&
                    enderecos.map( item => <Marker position={item} /> )
                }
                {
                    origem && <Marker position={origem} />
                }
            </GoogleMap>
        </LoadScript>
    );

};