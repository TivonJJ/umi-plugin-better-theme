const hash = require('hash.js');

exports.genHashCode = content =>
    hash
        .sha256()
        .update(content)
        .digest('hex');
