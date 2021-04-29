const fs = require('fs');
const crypto = require('crypto');

const getHash = (filePath)=>{
    const buffer = fs.readFileSync(filePath);
    const fsHash = crypto.createHash('md4');
    fsHash.update(buffer);
    const md5 = fsHash.digest('hex');
    return md5.substr(0,8)
}

module.exports = getHash;
