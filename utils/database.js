const mysql = require('mysql2');
 
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-online-shop',
    password: 'itinerary45'
});

module.exports = pool.promise();