const bcrypt = require('bcrypt');
const { initDB, getDB } = require('../src/config/db');
const { findForLogin } = require('../src/models/userModel');

(async () => {
  try {
    await initDB();
    const user = await findForLogin('admin@gmail.com');
    console.log('found user:', user ? {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      password: user.password && user.password.slice(0, 20) + '...'
    } : null);

    if (user) {
      const ok = await bcrypt.compare('admin@123', user.password);
      console.log('bcrypt compare result:', ok);
    }
  } catch (error) {
    console.error('error:', error);
    process.exit(1);
  }
})();
