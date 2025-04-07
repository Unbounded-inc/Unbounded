const jwt = require("jsonwebtoken");

function verifyUser(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    try {
        const decoded = jwt.decode(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
}

module.exports = verifyUser;
