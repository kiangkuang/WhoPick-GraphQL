import Sequelize, { Model } from 'sequelize';

class Question extends Model {
  static associate(models) {
    Question.Options = Question.hasMany(models.Option, {
      foreignKey: 'questionId',
      as: 'options',
    });
  }
}

const tableName = 'questions';

const schema = {
  question: Sequelize.STRING,
  userId: Sequelize.INTEGER,
  name: Sequelize.STRING,
  isEnabled: {
    type: Sequelize.BOOLEAN,
    defaultValue: 0,
  },
};

export default (sequelize) => {
  Question.init(schema, {
    sequelize,
    tableName,
  });

  return Question;
};
