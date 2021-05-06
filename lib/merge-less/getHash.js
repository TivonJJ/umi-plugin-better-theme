'use strict';

var fs = require('fs');
var crypto = require('crypto');

var getHash = function getHash(filePath) {
    var buffer = fs.readFileSync(filePath);
    var fsHash = crypto.createHash('md4');
    fsHash.update(buffer);
    var md5 = fsHash.digest('hex');
    return md5.substr(0, 8);
};

module.exports = getHash;