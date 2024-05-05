const { Order } = require('../../../models');

async function getOrders() {
  return Order.find({});
}

async function getOrder(id) {
  return Order.findById(id);
}

async function createOrder(product, quantity, price) {
  return Order.create({ product, quantity, price });
}

async function updateOrder(id, product, quantity, price) {
  return Order.updateOne(
    { _id: id },
    {
      $set: {
        product,
        quantity,
        price,
      },
    }
  );
}

async function deleteOrder(id) {
  return User.deleteOne({ _id: id });
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
