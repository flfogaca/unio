const bcrypt = require('bcrypt');

async function testPassword() {
  const hash = '$2a$10$GErhFZaYQjN66YKzNxUdBeISXjPLDy9jBle4ybt7GQuBYB2hy6zXm';
  const password = 'admin123';

  const result = await bcrypt.compare(password, hash);
  console.log('Password match:', result);
}

testPassword();
