'use strict';

var hash = require('hash.js');

exports.genHashCode = function (content) {
    return hash.sha256().update(content).digest('hex');
};