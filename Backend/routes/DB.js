const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: process.env.DB_MAX,
  idleTimeoutMillis: process.env.DB_IDLETIMEOUTMILLLIS,
  connectionTimeoutMillis: process.env.DB_CONNECTIONTIMEOUTMILLES
})

async function query (text, params) {
  try {
    res = await pool.query(text, params)
    // console.log("await res ==>", res)
    return res
  } catch (err) {
    console.log('pool error ==>', err)
    return { err: 1 }
  }
}

module.exports = {
  query: (text, params) => query(text, params),
  callback: (text, params, callback) => pool.query(text, params, callback)
}
