const pool = require('../config/database');
const bcrypt = require('bcryptjs');

async function run() {
  const username = 'jai';
  const password = '212121';
  const email = 'jai@elyoo.com';

  const conn = await pool.getConnection();
  try {
    // Check existing
    const [rows] = await conn.query('SELECT id FROM admins WHERE username = ?', [username]);
    if (rows.length > 0) {
      console.log('Local staff account already exists.');
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const [res] = await conn.query('INSERT INTO admins (username, password, email, role) VALUES (?, ?, ?, ?)', [username, hash, email, 'staff']);
    console.log('Inserted local staff account with id', res.insertId);
  } catch (err) {
    console.error('Error creating staff account:', err.message || err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

run();
