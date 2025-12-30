const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const header = req.headers['authorization'] || req.headers['Authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.userId = decoded.id;
        req.user = { id: decoded.id };

        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token is not valid' });
    }
};