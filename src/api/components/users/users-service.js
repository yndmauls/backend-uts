const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers({
  pageNumber,
  pageSize,
  sortField,
  sortDirection,
  search,
}) {
  try {
    let users = await usersRepository.getUsers();
    if (search && typeof search === 'string') {
      const [searchField, searchTerm] = search.split(':');

      if (searchField && ['email', 'name'].includes(searchField)) {
        const lowerSearchTerm = searchTerm.toLowerCase();

        users = users.filter((user) => {
          const fieldValue = user[searchField];
          return (
            fieldValue && fieldValue.toLowerCase().includes(lowerSearchTerm)
          );
        });
      }
    }

    if (
      sortField &&
      sortDirection &&
      ['email', 'name'].includes(sortField) &&
      ['asc', 'desc'].includes(sortDirection)
    ) {
      users.sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        const valueA = fieldA.toLowerCase();
        const valueB = fieldB.toLowerCase();
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      });
    }

    const totalUsers = users.length;
    if (pageSize === undefined) {
      pageSize = totalUsers;
    }
    const totalPages = Math.ceil(totalUsers / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = Math.min(pageNumber * pageSize, totalUsers);
    const usersPerPage = users.slice(startIndex, endIndex);
    const formattedUsers = usersPerPage.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

    return {
      pageNumber,
      pageSize,
      count: formattedUsers.length,
      total_pages: totalPages,
      has_previous_page: pageNumber > 1,
      has_next_page: endIndex < totalUsers,
      data: formattedUsers,
    };
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
