const express = require('express');
const routes = require('./routes');
var cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

const port_n = 3333;
app.listen(port_n, '0.0.0.0', function(){
    console.log('Listening to port: ' + port_n);
});