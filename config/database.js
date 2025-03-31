const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'gestion_productos'
});

const promisePool = pool.promise();

module.exports = promisePool;