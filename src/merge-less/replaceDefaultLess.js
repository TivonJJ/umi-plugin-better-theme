'use strict';

var fs = require('fs-extra');

var replaceDefaultLess = function replaceDefaultLess(lessPath) {
  var fileContent = fs.readFileSync(lessPath).toString();
  return fileContent;
};
module.exports = replaceDefaultLess;