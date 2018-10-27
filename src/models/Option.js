import Sequelize, { Model } from 'sequelize';

class Option extends Model {
  static associate(models) {
    Option.Question = Option.belongsTo(models.Question, {
      foreignKey: 'questionId',
      as: 'question',
    });
    Option.Votes = Option.hasMany(models.Vote, {
      foreignKey: 'optionId',
      as: 'votes',
    });
  }
}

const tableName = 'options';

const schema = {
  option: Sequelize.STRING,
  questionId: Sequelize.INTEGER,
};

export default (sequelize) => {
  Option.init(schema, {
    sequelize,
    tableName,
  });

  return Option;
};
