const bcrypt = require('bcrypt');
module.exports = {
    hashedPassword: (password) => {
        return bcrypt.hashSync(password, 10);
    },
    comparePassword: (password, hashedPassword) => {
        return bcrypt.compare(password, hashedPassword);
    }
}