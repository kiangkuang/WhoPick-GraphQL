import cryptoJs from 'crypto-js';
import jwt from 'jsonwebtoken';
import config from './config';

function getToken(request) {
  if (request.headers.authorization && request.headers.authorization.split(' ')[0] === 'Bearer') {
    return request.headers.authorization.split(' ')[1];
  } if (request.query && request.query.token) {
    return request.query.token;
  } if (request.cookies && request.cookies.jwt) {
    return request.cookies.jwt;
  }
  return null;
}

export default {
  expressJwtOptions: {
    secret: config.jwtSecret,
    getToken,
  },
  createToken: query => jwt.sign(query, config.jwtSecret),
  isAuthenticated: (request) => {
    try {
      const verify = jwt.verify(getToken(request), config.jwtSecret);
      console.log(verify);
      return verify;
    } catch (e) {
      return null;
    }
  },
  isAuthorized: user => user != null && config.adminIds.includes(user.id),
  isTelegramAuthenticationValid: (query) => {
    const dataCheckString = Object.keys(query)
      .filter(x => x !== 'hash')
      .sort()
      .map(x => `${x}=${query[x]}`)
      .join('\n');
    const secretKey = cryptoJs.SHA256(config.botToken);
    const hash = cryptoJs.HmacSHA256(dataCheckString, secretKey).toString(cryptoJs.enc.Hex);
    return hash === query.hash;
  },
};
