/**
 * Interactive helper — creates supabase.connection.json
 * Usage: node scripts/setup-supabase.js
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const configPath = path.join(__dirname, '..', 'supabase.connection.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function main() {
  console.log('\nElyoo Mobile — Supabase setup\n');
  console.log('Get these from: Supabase Dashboard → Project Settings → API\n');

  const url = (await ask('Project URL (https://xxxx.supabase.co): ')).trim();
  const anonKey = (await ask('anon public key: ')).trim();

  if (!url.includes('supabase.co') || anonKey.length < 20) {
    console.error('Invalid URL or key. Try again.');
    rl.close();
    process.exit(1);
  }

  fs.writeFileSync(
    configPath,
    JSON.stringify({ url: url.replace(/\/$/, ''), anonKey }, null, 2)
  );

  console.log('\nSaved supabase.connection.json');
  console.log('\nIMPORTANT — create the database tables:');
  console.log('  1. Supabase Dashboard → SQL Editor → New query');
  console.log('  2. Open and run: supabase/SETUP_ALL.sql (copy entire file)');
  console.log('  3. See SETUP_DATABASE.md for details\n');
  console.log('Then run: npm start\n');

  rl.close();
}

main();
