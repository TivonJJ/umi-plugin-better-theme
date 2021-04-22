'use strict';

module.exports = function (path) {
  var antdProPath = path.match(/src(.*)/)[1].replace('.less', '');
  var arr = antdProPath.split('/').map(function (a) {
    return a.replace(/([A-Z])/g, '-$1');
  }).map(function (a) {
    return a.toLowerCase();
  });
  return ('rubus' + arr.join('-') + '-').replace(/--/g, '-');
};