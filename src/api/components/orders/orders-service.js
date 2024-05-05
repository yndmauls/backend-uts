const { price } = require('../../../models/orders-schema');
const ordersRepository = require('./orders-repository');

async function getOrders({
  pageNumber,
  pageSize,
  sortField,
  sortDirection,
  search,
}) {
  let orders = await ordersRepository.getOrders();
  if (search) {
    const [searchField, searchValue] = search.split(':');
    if (searchField && searchValue) {
      const searchRegex = new RegExp(searchValue, 'i');
      orders = orders.filter((order) => {
        return order[searchField] && order[searchField].match(searchRegex);
      });
    }
  }
  orders.sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    return sortDirection === 'asc'
      ? fieldA.localeCompare(fieldB)
      : fieldB.localeCompare(fieldA);
  });

  const totalOrders = orders.length;
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = Math.min(pageNumber * pageSize, totalOrders);
  const ordersPerPage = orders.slice(startIndex, endIndex);

  return {
    pageNumber,
    pageSize,
    count: ordersPerPage.length,
    totalPages,
    hasPreviousPage: pageNumber > 1,
    hasNextPage: pageNumber < totalPages,
    data: ordersPerPage.map((order) => ({
      id: order.id,
      product: order.product,
      quantity: order.quantity,
      price: order.price,
    })),
  };
}

async function getOrder(id) {
  const order = await ordersRepository.getOrder(id);
  if (!order) {
    return null;
  }

  return {
    product: order.product,
    quantity: order.quantity,
    price: order.price,
  };
}

async function createOrder(product, quantity, price) {
  try {
    await ordersRepository.createOrder(product, quantity, price);
  } catch (err) {
    return null;
  }
  return true;
}

async function updateOrder(id, product, quantity, price) {
  const order = await ordersRepository.getOrder(id);
  if (!order) {
    return null;
  }
  try {
    await ordersRepository.updateOrder(id, product, quantity, price);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function deleteOrder(id) {
  const order = await ordersRepository.getOrder(id);
  if (!order) {
    return null;
  }

  try {
    await ordersRepository.deleteOrder(id);
  } catch (err) {
    return null;
  }

  return true;
}

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
};
