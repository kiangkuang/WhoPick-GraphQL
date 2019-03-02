import { resolver } from 'graphql-sequelize';
import { where, col, Op } from 'sequelize';
import models from './models';

const resolvers = {
  Query: {
    question: resolver(models.Question),
    questions: resolver(models.Question, {
      before: (findOptions, {
        question, userId, name, isEnabled,
      }) => {
        function ignoreColumn(column) {
          return where(col(column), Op.eq, col(column));
        }

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

export default resolvers;
