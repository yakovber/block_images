const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/default');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('נדרשת התחברות');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('טוקן לא תקין');
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (!req.user.isAdmin) {
        return res.status(403).send('נדרשות הרשאות מנהל');
    }
    next();
}



module.exports = { authenticateToken, requireAdmin };