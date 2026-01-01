const jwt = require('jsonwebtoken');

exports.verifyTokenAndGetRole = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            message: "Access Denied. Token is missing or improperly formatted." 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();

    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(403).json({ 
            message: "Invalid or expired token.", 
            error: error.message 
        });
    }
};