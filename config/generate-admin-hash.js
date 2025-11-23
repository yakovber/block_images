const bcrypt = require('bcrypt');

const adminCode = ''; // הקוד הסודי שלך
const saltRounds = 10;

bcrypt.hash(adminCode, saltRounds).then(hash => {
    console.log('Admin Code Hash:', hash);
});