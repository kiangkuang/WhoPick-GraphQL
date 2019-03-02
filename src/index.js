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
  context: () => {
    // For each request, create a DataLoader context for Sequelize to use
    const dataloaderContext = createContext(models.sequelize);

    // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
    // in the global request context
    return {
      [EXPECTED_OPTIONS_KEY]: dataloaderContext,
    };
  },
});

server.use(cookieParser());
server.use(expressJwt(auth.expressJwtOptions)
  .unless({ path: ['/', /\/auth*/] }));

server.get('/', (_, res) => {
  res.redirect('auth/login');
});

server.get('/auth/login', (_, res) => {
  res.send(`<body><script async src="https://telegram.org/js/telegram-widget.js" data-telegram-login="${config.botUsername}" data-size="large" data-auth-url="/auth/callback"></script></body>`);
});

server.get('/auth/callback', ({ query }, res) => {
  if (auth.isAuthorized(query)) {
    res.cookie('jwt', auth.createToken(query.id));
    res.redirect('/playground');
  } else {
    res.sendStatus(403);
  }
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
