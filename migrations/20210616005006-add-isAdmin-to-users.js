'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'isAdmin', {
      type: Sequelize.BOOLEAN,
      defaultValue: 0
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', 'isAdmin')
  }
};
