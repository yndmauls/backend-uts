const ordersService = require('./orders-service');

async function getOrders(request, response, next) {
  const {
    page_number = '1',
    page_size = '10',
    sort = 'product:asc',
    search = '',
  } = request.query;
  const pageNumber = parseInt(page_number) || 1;
  const pageSize = parseInt(page_size) || 10;
  const [sortField, sortDirection] = sort.split(':');

  try {
    const orders = await ordersService.getOrders({
      pageNumber,
      pageSize,
      sortField,
      sortDirection,
      search,
    });

    response.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

async function getOrder(request, response, next) {
  try {
    const order = await ordersService.getOrder(request.params.id);

    if (!order) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Order Not Found');
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

async function createOrder(request, response, next) {
  try {
    const product = request.body.product;
    const quantity = request.body.quantity;
    const price = request.body.price;

    const success = await ordersService.createOrder(product, quantity, price);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create Order'
      );
    }

    return response.status(200).json({ product, quantity, price });
  } catch (error) {
    return next(error);
  }
}

async function updateOrder(request, response, next) {
  try {
    const orderID = request.params.id;
    const product = request.body.product;
    const quantity = request.body.quantity;
    const price = request.body.price;

    const success = await ordersService.updateOrder(
      orderID,
      product,
      quantity,
      price
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update order'
      );
    }

    return response.status(200).json({ id: orderID });
  } catch (error) {
    return next(error);
  }
}

async function deleteOrder(request, response, next) {
  try {
    const id = request.params.id;
    const success = await ordersService.deleteOrder(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete order'
      );
    }
    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
