const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Tech-Stack-reactNative-Node-js-express-Mongo-DB@db.ojibuhaovoohpzmorsek.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function runSchema() {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');
    
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    await client.query(schemaSql);
    console.log('Successfully executed schema.sql.');
    
  } catch (err) {
    console.error('Error executing schema:', err.message);
  } finally {
    await client.end();
  }
}

runSchema();
