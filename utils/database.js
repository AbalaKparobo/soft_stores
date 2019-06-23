const Sequelize = require('sequelize');

const sequelize = new Sequelize('node-online-shop', 'root', 'itinerary45', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;