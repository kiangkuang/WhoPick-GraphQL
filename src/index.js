import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver } from 'graphql-sequelize';
import jwt from 'express-jwt';
import config from './config';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import models from './models';

resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request }) => {
    // For each request, create a DataLoader context for Sequelize to use
    const dataloaderContext = createContext(models.sequelize);

    // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
    // in the global request context
    return {
      [EXPECTED_OPTIONS_KEY]: dataloaderContext,
      user: request.user,
    };
  },
});

server.use(jwt({
  secret: config.jwtSecret,
  credentialsRequired: false,
}));

server.start({ port: config.port }, () => console.log(`Server is running on localhost:${config.port}`));
