'use strict';

var deleteRelativePath = function deleteRelativePath(array) {
  return array.filter(function (file) {
    return !file.includes('~@');
  });
};

module.exports = deleteRelativePath;