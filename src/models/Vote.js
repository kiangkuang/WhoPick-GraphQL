import Sequelize, { Model } from 'sequelize';

class Vote extends Model {
  static associate(models) {
    Vote.Option = Vote.belongsTo(models.Option, {
      foreignKey: 'optionId',
      as: 'option',
    });
  }
}

const tableName = 'votes';

const schema = {
  name: Sequelize.STRING,
  userId: {
    type: Sequelize.INTEGER,
    unique: 'userId_optionId_UNIQUE',
  },
  optionId: {
    type: Sequelize.INTEGER,
    unique: 'userId_optionId_UNIQUE',
  },
};

export default (sequelize) => {
  Vote.init(schema, {
    sequelize,
    tableName,
  });

  return Vote;
};
