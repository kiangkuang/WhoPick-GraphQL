import { GraphQLServer } from 'graphql-yoga';
import { createContext, EXPECTED_OPTIONS_KEY } from 'dataloader-sequelize';
import { resolver } from 'graphql-sequelize';
import models from './models';
import config from './config';

const typeDefs = `
  type Query {
    question(id: Int!): Question,
    questions: [Question!]!,
  }

  type Question {
    id: Int!,
    question: String!,
    userId: Int!,
    name: String!,
    options: [Option!]!,
  }

  type Option {
    id: Int!,
    option: String!,
    votes: [Vote!]!,
    question: Question!
  }

  type Vote {
    id: Int!,
    userId: Int!,
    name: String!,
    option: Option!
  }
`;

const resolvers = {
  Query: {
    question: resolver(models.Question),
    questions: resolver(models.Question),
  },
  Question: {
    options: resolver(models.Question.Options),
  },
  Option: {
    question: resolver(models.Option.Question),
    votes: resolver(models.Option.Votes),
  },
  Vote: {
    option: resolver(models.Vote.Option),
  },
};

resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY };

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context() {
    // For each request, create a DataLoader context for Sequelize to use
    const dataloaderContext = createContext(models.sequelize);

    // Using the same EXPECTED_OPTIONS_KEY, store the DataLoader context
    // in the global request context
    return {
      [EXPECTED_OPTIONS_KEY]: dataloaderContext,
    };
  },
});
server.start({ port: config.port }, () => console.log(`Server is running on localhost:${config.port}`));
