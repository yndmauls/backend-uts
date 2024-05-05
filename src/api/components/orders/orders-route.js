const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const ordersControllers = require('./orders-controller');
const ordersValidator = require('./orders-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/orders', route);

  route.get('/', authenticationMiddleware, ordersControllers.getOrders);

  route.post(
    '/',
    authenticationMiddleware,
    celebrate(ordersValidator.createOrder),
    ordersControllers.createOrder
  );

  route.get('/:id', authenticationMiddleware, ordersControllers.getOrder);

  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(ordersValidator.updateOrder),
    ordersControllers.updateOrder
  );

  route.delete('/:id', authenticationMiddleware, ordersControllers.deleteOrder);
};
