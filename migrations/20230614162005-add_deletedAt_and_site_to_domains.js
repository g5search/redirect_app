'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('domains', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add siteId column to domains table for association
    await queryInterface.addColumn('domains', 'site_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'sites', // name of Target model
        key: 'id', // key in Target model that we're referencing
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove deletedAt column from domains table
    await queryInterface.removeColumn('domains', 'deletedAt');

    // Remove siteId column from domains table
    await queryInterface.removeColumn('domains', 'site_id');
  }
};
