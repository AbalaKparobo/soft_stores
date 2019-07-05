// require('dotenv').config;

require('dotenv').config({ debug: process.env.DEBUG })

module.exports = {
    port: process.env.PORT,
    DB_URI: process.env.MONGODB_URI,
    mailer_api_key: process.env.mailer_api_key
}