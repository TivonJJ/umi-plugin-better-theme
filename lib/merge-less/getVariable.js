'use strict';

var postcss = require('postcss');
var syntax = require('postcss-less');
var uniqBy = require('lodash.uniqby');
var postcssUrl = require('postcss-url');
var winPath = require('slash2');
var getHash = require('./getHash');
var path = require('path');

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

var getVariable = function getVariable(cwd, lessPath, lessText) {
  return postcss([removeNoVarLessPlugin()]).use(postcssUrl({
    url: function url(assets) {
      if (/^~@/.test(assets.url)) {
        var absPath = path.join(cwd, 'src', assets.url.replace(/^~@/, ''));
        var hash = getHash(absPath);
        var en = path.extname(assets.url);
        var bn = path.basename(assets.url, en);
        return winPath(path.join('../static/', bn + '.' + hash + en));
      }
      return assets.url;
    }
  })).use(postcssUrl({
    url: 'inline'
  })).process(lessText, {
    from: lessPath,
    syntax: syntax
  }).then(function (result) {
    // eslint-disable-next-line no-param-reassign
    result.messages = uniqBy(fileNameList);
    return result;
  });
};

module.exports = getVariable;