const Sequelize = require('sequelize');

const sql = require('../utils/database');

const Order = sql.define('order', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }
})

module.exports = Order;