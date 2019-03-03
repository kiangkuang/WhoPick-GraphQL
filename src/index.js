import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver } from 'graphql-sequelize';
import expressJwt from 'express-jwt';
import expressPlayground from 'graphql-playground-middleware-express';
import cookieParser from 'cookie-parser';
import config from './config';
import auth from './auth';
import models from './models';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: () => ({
    [EXPECTED_OPTIONS_KEY]: createContext(models.sequelize),
  }),
});

server.use(cookieParser());
server.use(expressJwt(auth.expressJwtOptions)
  .unless({ path: ['/', /\/auth*/] }));
server.use((req, res, next) => {
  if (req.path !== '/' && !req.path.startsWith('/auth') && !auth.isAuthorized(req.user)) {
    next(new Error('UnauthorizedError'));
    return;
  }
  next();
});
server.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.sendStatus(401);
    return;
  }
  next();
});

server.get('/', (_, res) => {
  res.redirect('/auth/login');
});

server.get('/auth/login', (req, res) => {
  if (auth.isAuthorized(auth.isAuthenticated(req))) {
    res.redirect('/playground');
    return;
  }
  res.send(`<body><script async src="https://telegram.org/js/telegram-widget.js" data-telegram-login="${config.botUsername}" data-size="large" data-auth-url="/auth/callback"></script></body>`);
});

server.get('/auth/callback', ({ query }, res) => {
  if (!auth.isTelegramAuthenticationValid(query) || !auth.isAuthorized(query)) {
    res.sendStatus(403);
    return;
  }
  res.cookie('jwt', auth.createToken(query));
  res.redirect('/playground');
});

server.get('/playground', expressPlayground({
  endpoint: '/graphql',
  settings: { 'request.credentials': 'same-origin' },
}));

server.start({
  port: config.port,
  endpoint: '/graphql',
  playground: false,
}, () => console.log(`Server is running on localhost:${config.port}`));
