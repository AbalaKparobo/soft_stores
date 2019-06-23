const Sequelize = require('sequelize');

const sql = require('../utils/database');

const CartItem = sql.define('cartItem', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    quantity: Sequelize.INTEGER
})

module.exports = CartItem;