const express = require('express');
const verifyJWT = require('./Controllers/verifyJWT');

const routes = express.Router();

const carregamento = require('./Controllers/carregamento');
const descarregamento = require('./Controllers/descarregamento');
const map = require('./Controllers/maps');
const user = require('./Controllers/users');
const coments = require('./Controllers/comentarios');
const roles = require('./Controllers/roles');
const assinaturas = require('./Controllers/assinaturas');
const { alertComment, alertStatus } = require('./Controllers/emails')

// Verifica se o usuário está autenticado
const checkAuth = verifyJWT.middleware_verifyJWT;

// Verifica se o usuário está com os dados atualizados ao fazer uma alteração de status
const carr_autorizaAtualizacaoStatus = carregamento.autorizaAtualizacaoStatus;
const desc_autorizaAtualizacaoStatus = descarregamento.autorizaAtualizacaoStatus;

// Verifica se já existe os pesos necessários para prosseguir com o próximo status
const carr_solicitaPeso = carregamento.Mid_controleStatus;
const desc_solicitaPeso = descarregamento.Mid_controleStatus;

// Verifica se o usuário possui a role necessária para a atualização solicitada
const checa_role = roles.Mid_checaRole;

// Controladores das assinaturas
const { criaAssinatura, removeAssinatura } = assinaturas;

// Inserir as rotas do App de rastreamento
// Quando uma etiqueta de produção é recebida com os dados de data e sequencia
routes.post('/mapa', checkAuth, carregamento.get_carregamento_data);
routes.post('/material', checkAuth, descarregamento.get_descarregamento_data_v2);

routes.patch('/upd_carregamento', checkAuth, checa_role, carr_autorizaAtualizacaoStatus, carr_solicitaPeso, alertStatus, carregamento.atualiza_status_carregamento);
routes.patch('/upd_descarregamento', checkAuth, checa_role, desc_autorizaAtualizacaoStatus, desc_solicitaPeso, alertStatus, descarregamento.atualiza_status_descarregamento);

routes.post('/validaMudancaStatusCarr', checkAuth, carregamento.controleStatus);
routes.post('/validaMudancaStatusDesc', checkAuth, descarregamento.controleStatus);

routes.post('/rota', checkAuth, map.mapa); 
routes.get('/endereco', checkAuth, map.partida);

routes.post('/createUser', user.createUser);
routes.post('/logUser', user.logUser);
routes.get('/verifyJWT', verifyJWT.verifyJWT);

routes.post('/addComent', checkAuth, alertComment, coments.salvaDados);
routes.get('/getComents', checkAuth, coments.buscaDados);

routes.post('/assina', checkAuth, criaAssinatura );
routes.delete('/removeAssinatura', checkAuth, removeAssinatura );

module.exports = routes;