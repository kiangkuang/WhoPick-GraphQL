import cryptoJs from 'crypto-js';
import jwt from 'jsonwebtoken';
import config from './config';

function getToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } if (req.query && req.query.token) {
    return req.query.token;
  } if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }
  return null;
}

function validateTelegramAuthorization(query) {
  const dataCheckString = Object.keys(query)
    .filter(x => x !== 'hash')
    .sort()
    .map(x => `${x}=${query[x]}`)
    .join('\n');
  const secretKey = cryptoJs.SHA256(config.botToken);
  return cryptoJs.HmacSHA256(dataCheckString, secretKey).toString(cryptoJs.enc.Hex) === query.hash;
}

export default {
  expressJwtOptions: {
    secret: config.jwtSecret,
    getToken,
  },
  createToken: id => jwt.sign(id, config.jwtSecret),
  isAuthorized: query => validateTelegramAuthorization(query)
    && config.adminIds.includes(query.id),
};
