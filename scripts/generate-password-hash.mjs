import bcrypt from 'bcryptjs';

const password = 'Bogenk.313';
const saltRounds = 12;

const hash = await bcrypt.hash(password, saltRounds);

console.log('\n=================================');
console.log('Password:', password);
console.log('Bcrypt Hash:', hash);
console.log('=================================\n');
console.log('SQL Query to update:');
console.log(`UPDATE users SET password = '${hash}', must_change_password = false WHERE email = 'superadmin@bemfkip.ac.id';`);
console.log('\n');
