// Business logic related to Manager can be added here
const jwt = require('jsonwebtoken');

exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
