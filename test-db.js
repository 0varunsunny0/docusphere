const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log("SUCCESS:", res.rows[0]);
  } catch (err) {
    console.error("FAILED:", err.message);
  } finally {
    await client.end();
  }
}

test();
