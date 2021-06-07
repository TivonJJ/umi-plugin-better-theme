#!/usr/bin/env node
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * 这个方法用来处理 css-module
 * 由于没有开源插件，所以自己撸了一个
 */
var glob = require('glob');
var uniqBy = require('lodash.uniqby');

var _require = require('umi-utils'),
    winPath = _require.winPath;

var path = require('path');
var minimatch = require('minimatch');

var AddLocalIdentName = require('./AddLocalIdentName');
var replaceDefaultLess = require('./replaceDefaultLess');
var lessOrder = require('./lessOrder');

// read less file list
var genModuleLess = function genModuleLess(parents, _ref) {
  var isModule = _ref.isModule,
      filterFileLess = _ref.filterFileLess,
      publicLessPath = _ref.publicLessPath;

  var lessArray = [];
  var promiseList = [];
  lessArray = [];
  glob.sync(winPath(parents + '/**/**.less')).sort(function (a, b) {
    return lessOrder(a) - lessOrder(b);
  }).filter(function (filePath) {
    var relativePath = path.relative(parents, filePath);
    var ignore = ['**/node_modules/**', '**/dist/**', '**/es/**', '**/lib/**', '**/_site/**'];
    if (minimatch.apply(undefined, [relativePath].concat(ignore))) {
      return false;
    }
    if (filePath.includes('ant.design.pro.less') || filePath.includes('global.less') || filePath.includes('bezierEasing.less') || filePath.includes('colorPalette.less') || filePath.includes('tinyColor.less')) {
      return false;
    }
    if (filterFileLess) {
      return filterFileLess(filePath);
    }
    return true;
  }).forEach(function (realPath) {
    // post css add localIdentNamePlugin
    var fileContent = replaceDefaultLess(realPath);
    promiseList.push(AddLocalIdentName(parents, realPath, fileContent, isModule, publicLessPath));
  });

  return Promise.all(promiseList).then(function (content) {
    var allFileList = [];
    content.map(function (item) {
      var _item$messages = item.messages,
          fileList = _item$messages.fileList,
          name = _item$messages.name;

      allFileList = allFileList.concat([name].concat(_toConsumableArray(fileList)));
      return item;
    });
    var fileString = uniqBy(allFileList).join('-');
    return lessArray.concat(content.sort(function (a, b) {
      var aName = a.messages.name;
      var bName = b.messages.name;
      if (aName.includes('v2-compatible-reset')) {
        return 1;
      }
      if (bName.includes('v2-compatible-reset')) {
        return -1;
      }
      return fileString.indexOf(aName) - fileString.indexOf(bName);
    })).join('\n');
  });
};

module.exports = genModuleLess;