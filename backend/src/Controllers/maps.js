const axios = require('axios');
const decodePolyline = require('decode-google-map-polyline');
const NodeGeocoder = require('node-geocoder');
const connection = require('../database/connection');
require('dotenv/config');

module.exports = {
    async mapa ( request, response ) {

        console.log('Rota solicitada');

        const { Origem, Entregas } = request.body;

        // Valida se existe entregas a serem feitas
        if ( !Entregas ) {
            return response.status(400).json({ error: 'As entregas deve ser especificadas' });
        };
        if ( !Origem ) {
            return response.status(400).json({ error: 'A origem deve ser especificada' });
        };

        const key = process.env.KEY_GOOGLE_MAPS;

        const geo_options = {
            provider: 'google',
            apiKey: key,
            formatter: null
        };
        const geocoder = NodeGeocoder(geo_options);

        // Função para organizar o array de entregas pela ordem das entregas
        Entregas.sort( (a, b) => a.Ordem_entrega - b.Ordem_entrega );
        const entregas_arr = Entregas.map( item => item.Endereco );
        
        // Função iteradora concatenar os pontos intermediários com '|'
        const concatena_waypoints = ( item, index, arr ) => {
            if ( index < arr.length - 1 ) {
                return encodeURI(item) + '|'
            } else {
                return encodeURI(item)
            };
        };

        var enderecos;
        Promise.all( entregas_arr.map( async ( item ) => await geocoder.geocode( item ) ) )
                                                                        .then( 
                                                                            (valores) => enderecos = valores.map( item => {
                                                                                    return { lat: item[0].latitude, lng: item[0].longitude }
                                                                                }
                                                                            )
                                                                        );

        const origem = encodeURI(Origem);
        const destino = encodeURI( entregas_arr.pop() );
        const waypoints = entregas_arr.map( concatena_waypoints );

        // URL para buscar a polyline
        const direction_base_url = 'https://maps.googleapis.com/maps/api/directions/json?';
        const url_direction = `${direction_base_url}origin=${ origem }&destination=${ destino }${ ( waypoints && waypoints.length > 0 )?'&waypoints='+waypoints:'' }&key=${key}`;
        
        // Função de callback para quando receber a polyline
        const callback = async ( resposta ) => {
            // Busca a polyline e a latitude e longitude da origem e destino
            const {
                routes: [{ 
                        overview_polyline: { points },
                        bounds: { 
                            northeast: { lat: n_lat, lng: n_lng },
                            southwest: { lat: s_lat, lng: s_lng },
                        }
                }],
            } = resposta.data;

            // Calcula o ponto médio entre origem e destino
            const lat_center_0 = Number( ( (n_lat + s_lat)/2 ).toFixed(6) );
            const lng_center_0 = Number( ( (n_lng + s_lng)/2 ).toFixed(6) );

            const origem_geo = await geocoder.geocode( Origem );
            const origem_geo_tratado = { lat: origem_geo[0].latitude, lng: origem_geo[0].longitude };

            const polyline = decodePolyline(points);

            return response.status(200).json({
                                            lat_center_0,
                                            lng_center_0,
                                            origem: origem_geo_tratado,
                                            enderecos,
                                            polyline
                                        });
        };

        // Requisita a polyline
        axios.get( url_direction )
            .then( response => callback(response) )
            .catch( err => console.log(err) );

    },

    async partida ( request, response ) {

        console.log('Partia solicitada');
        
        const { Unidade } = request.query;

        try {

            const [{ Endereco }] = await connection('dUnidades')
            .select('*')
            .where('Unidade', '=', Unidade);

            return response.status(200).json({ Endereco });

        } catch (error) {
            
            console.log( error )

            return response.status(404).json({ err: 'Unidade não encontrada.' });
        };

    },
};