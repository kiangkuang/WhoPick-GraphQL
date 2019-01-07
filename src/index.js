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
    isEnabled: Boolean!,
  }

  type Option {
    id: Int!,
    option: String!,
    votes: [Vote!]!,
    question: Question!,
  }

  type Vote {
    id: Int!,
    userId: Int!,
    name: String!,
    option: Option!,
  }

  type Mutation {
    createQuestion(userId: Int!, name: String!, question: String!): Question!,
    createOption(questionId: Int!, option: String!): Option!,
    createVote(optionId: Int!, userId: Int!, name: String!): Vote!,

    updateQuestion(id: Int!, question: String, isEnabled: Boolean): [Boolean!],
    updateOption(id: Int!, option: String!): [Boolean!],

    deleteOption(id: Int!): Boolean!,
    deleteVote(id: Int!): Boolean!,
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

  Mutation: {
    createQuestion: (_, { userId, name, question }) => {
      const values = { userId, name, question };
      return models.Question.create(values);
    },
    createOption: (_, { questionId, option }) => {
      const values = { questionId, option };
      return models.Option.create(values);
    },
    createVote: (_, { optionId, userId, name }) => {
      const values = { optionId, userId, name };
      return models.Vote.create(values);
    },

    updateQuestion: (_, { id, question, isEnabled }) => {
      const values = { question, isEnabled };
      const options = { where: { id } };
      return models.Question.update(values, options);
    },
    updateOption: (_, { id, option }) => {
      const values = { option };
      const options = { where: { id } };
      return models.Option.update(values, options);
    },

    deleteOption: (_, { id }) => models.Option.destroy({ where: { id } }),
    deleteVote: (_, { id }) => models.Vote.destroy({ where: { id } }),
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
