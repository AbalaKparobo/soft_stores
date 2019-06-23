const Sequelize = require('sequelize');

const sql = require('../utils/database');

const OrderItem = sql.define('orderItem', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    quantity: Sequelize.INTEGER
})

module.exports = OrderItem;