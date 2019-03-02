import { resolver } from 'graphql-sequelize';
import { where, col, Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import models from './models';
import config from './config';

function checkAuthentication(email, password) {
  console.log(email, password);
  return true;
}

function checkAuthorization(user) {
  if (user === undefined) throw new Error('You are not authenticated!');
}

function ignoreColumn(column) {
  return where(col(column), Op.eq, col(column));
}

const resolvers = {
  Query: {
    question: resolver(models.Question, {
      before: (findOptions, _, { user }) => {
        checkAuthorization(user);
        return findOptions;
      },
    }),
    questions: resolver(models.Question, {
      before: (findOptions, {
        question, userId, name, isEnabled,
      }, { user }) => {
        checkAuthorization(user);

        findOptions.where = {
          question: question === undefined ? ignoreColumn('question') : where(col('question'), Op.like, `%${question}%`),
          userId: userId === undefined ? ignoreColumn('userId') : userId,
          name: name === undefined ? ignoreColumn('name') : name,
          isEnabled: isEnabled === undefined ? ignoreColumn('isEnabled') : isEnabled,
        };
        return findOptions;
      },
    }),
  },

  Mutation: {
    login: (_, { email, password }) => {
      if (!checkAuthentication(email, password)) throw new Error('Login failed');
      return jwt.sign(
        { email, password },
        config.jwtSecret,
      );
    },

    createQuestion: (_, { userId, name, question }, { user }) => {
      checkAuthorization(user);
      return models.Question.create({ userId, name, question });
    },
    createOption: (_, { questionId, option }, { user }) => {
      checkAuthorization(user);
      return models.Option.create({ questionId, option });
    },
    createVote: (_, { optionId, userId, name }, { user }) => {
      checkAuthorization(user);
      return models.Vote.create({ optionId, userId, name });
    },

    updateQuestion: (_, { id, question, isEnabled }, { user }) => {
      checkAuthorization(user);
      const values = { question, isEnabled };
      const options = { where: { id } };
      return models.Question.update(values, options);
    },
    updateOption: (_, { id, option }, { user }) => {
      checkAuthorization(user);
      const values = { option };
      const options = { where: { id } };
      return models.Option.update(values, options);
    },

    deleteOption: (_, { id }, { user }) => {
      checkAuthorization(user);
      return models.Option.destroy({ where: { id } });
    },
    deleteVote: (_, { id }, { user }) => {
      checkAuthorization(user);
      return models.Vote.destroy({ where: { id } });
    },
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

export default resolvers;
