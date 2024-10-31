const crypto = require('crypto');

const generateTeamCode = () => new Promise((res, rej) => 
    crypto.randomBytes(3, (err, buffer) => {
        if (err) return rej(err);
        res(buffer.toString("hex").substring(0, 6));  // Grabs a 6-character hex string
    })
);

module.exports = generateTeamCode;