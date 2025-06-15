const jwt = require("jsonwebtoken");
const key = process.env.JWT_SECRET

// Generate a token
function getToken(req) {
    const data = { username: req.body.username };
    // Generate the token.
    const token = jwt.sign(data, key);
    // Return the token to the browser
    return token;
  }

const isLoggedIn = (req, res, next) => {
    // Check if the request has an authorization header
    if (req.headers.authorization) {
        // Extract the token from the header
        const token = req.headers.authorization.split(" ")[1];
        try {
            // Verify the token is valid
            const data = jwt.verify(token, key);
            console.log('The logged in user is: ' + data.username);
            // Attach user data to request object for use in other routes
            req.user = data;
            // Token validation was successful. Continue to the actual function (next)
            return next();
        } catch (err) {
            return res.status(401).send("Invalid Token");
        }
    } else {
        return res.status(403).send('Token required');
    }
};


module.exports = { isLoggedIn, getToken };
  