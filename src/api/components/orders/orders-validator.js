const joi = require('joi');

module.exports = {
  createOrder: {
    body: {
      product: joi.string().required().label('Product Name'),
      quantity: joi.number().required().label('Quantity'),
      price: joi.number().required().label('Total Price'),
    },
  },

  updateOrder: {
    body: {
      product: joi.string().required().label('Product Name'),
      quantity: joi.number().required().label('Quantity'),
      price: joi.number().required().label('Total Price'),
    },
  },
};
