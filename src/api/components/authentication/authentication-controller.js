const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
const failedLoginAttempts = {};
async function login(request, response, next) {
  const { email, password } = request.body;

  try {
    if (failedLoginAttempts[email] && failedLoginAttempts[email].count >= 6) {
      const lockoutTime = failedLoginAttempts[email].lockedUntil;
      if (Date.now() < lockoutTime) {
        const remainingTime = Math.ceil(
          (lockoutTime - Date.now()) / (1000 * 60)
        );
        return response.status(403).json({
          error: 'Forbidden',
          message: `Too many failed login attempts. Please try again after ${remainingTime} minutes.`,
        });
      } else {
        delete failedLoginAttempts[email];
      }
    }
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );
    if (!loginSuccess) {
      if (!failedLoginAttempts[email]) {
        failedLoginAttempts[email] = { count: 1 };
      } else {
        failedLoginAttempts[email].count++;
        if (failedLoginAttempts[email].count >= 6) {
          failedLoginAttempts[email].lockedUntil = Date.now() + 30 * 60 * 1000;
          return response.status(403).json({
            error: 'Forbidden',
            message:
              'Too many failed login attempts. Please try again after 30 minutes.',
          });
        }
      }
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }
    if (failedLoginAttempts[email]) {
      delete failedLoginAttempts[email];
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
