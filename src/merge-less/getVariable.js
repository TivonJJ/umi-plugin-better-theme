'use strict';

var postcss = require('postcss');
var syntax = require('postcss-less');
var uniqBy = require('lodash.uniqby');

var fileNameList = [];

var removeNoVarLessPlugin = postcss.plugin('LocalIdentNamePlugin', function () {
  return function (less) {
    less.walkAtRules(function (atRule) {
      if (atRule.import) {
        atRule.remove();
      }
    });

    less.walkComments(function (decls) {
      decls.remove();
    });
  };
});

var getVariable = function getVariable(lessPath, lessText) {
  return postcss([removeNoVarLessPlugin()]).process(lessText, {
    from: lessPath,
    syntax: syntax
  }).then(function (result) {
    // eslint-disable-next-line no-param-reassign
    result.messages = uniqBy(fileNameList);
    return result;
  });
};

module.exports = getVariable;