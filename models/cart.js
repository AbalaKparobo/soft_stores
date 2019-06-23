const Sequelize = require('sequelize');

const sql = require('../utils/database');

const Cart = sql.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    }
})

module.exports = Cart;