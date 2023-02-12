const jwt = require('jsonwebtoken');
const JWT_SECRET = "Harrisagoodboy";

const fetchuser = (req, res, next) => {

    // get user from jwd token and add id to req object
    const token = req.header('auth-token');

    // if token does not exit
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"})
    }

    // if token exists, then validate
    try { 
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;

        // heads to the next middleware
        next();

    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"})
    }
}

module.exports = fetchuser;