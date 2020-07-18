//we need jsonwebtoken to verify our tokens
const jwt = require('jsonwebtoken');
//we need the secret key from config
const config = require('config');

//this is our middleware and middleware is
// something that has access to our req,res objects
// next is so we can move on to the next middlware object
module.exports = function (req, res, next) {
  // Get token from header
  // we reference the x-auth-token which is our header key
  // that we send the token in
  const token = req.header('x-auth-token');

  //check if no token
  // 401 means not authorized
  if (!token) {
    return res.status(401).json({ msg: 'No token. Authorization denied!' });
  }
  //otherwise verify the token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    //now we take the request object and assign a value to user.
    // user is part of the json payload and we can access it
    // by using jwt for verifying the token and jwtSecret
    req.user = decoded.user;
    //lastly call next
    next();
  } catch (err) {
    res
      .status(401)
      .json({ msg: 'Token is not valid. Authorization definitely denied!' });
  }
};
