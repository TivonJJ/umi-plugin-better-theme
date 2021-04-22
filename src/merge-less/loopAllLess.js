'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var path = require('path');
var glob = require('glob');
var uniqBy = require('lodash.uniqby');
var prettier = require('prettier');

var getVariable = require('./getVariable');
var replaceDefaultLess = require('./replaceDefaultLess');
var deleteRelativePath = require('./removeRelativePath');
var lessOrder = require('./lessOrder');

// read less file list
var loopAllLess = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(parents) {
    var ignore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var promiseList, importFileList, lessDir, lessContentArray, content;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            promiseList = [];
            importFileList = [];
            lessDir = path.join(parents, '**/**.less');

            glob.sync(lessDir, { ignore: [] }).filter(function (filePath) {
              return !filePath.includes('ant.design.pro.less') && !filePath.includes('global.less');
            }).sort(function (a, b) {
              if (a.includes('index') && b.includes('index')) {
                return 0;
              }
              if (a.includes('index') && !b.includes('index')) {
                return -1;
              }
              return 1;
            }).sort(function (a, b) {
              return lessOrder(a) - lessOrder(b);
            }).filter(function (filePath) {
              if (filePath.includes('ant.design.pro.less') || filePath.includes('global.less') || filePath.includes('bezierEasing.less') || filePath.includes('colorPalette.less') || filePath.includes('tinyColor.less') || filePath.includes('~')) {
                return false;
              }
              if (ignore.some(function (ignorePath) {
                return filePath.includes(ignorePath);
              })) {
                return false;
              }

              return true;
            }).forEach(function (relayPath) {
              // post css add localIdentNameplugin
              var fileContent = replaceDefaultLess(relayPath);
              // push less file
              promiseList.push(getVariable(relayPath, fileContent).then(function (result) {
                importFileList = importFileList.concat(result.messages);
                return result.content.toString();
              }, function () {
                //             console.log(
                //               `
                // 文件： ${err.file} 报错，
                // 错误原因： ${err.name}`,
                //             );
              }));
            });
            _context.next = 6;
            return Promise.all(promiseList);

          case 6:
            lessContentArray = _context.sent;

            importFileList = deleteRelativePath(uniqBy(importFileList).map(function (file) {
              return '@import ' + file + ';';
            }));
            content = importFileList.concat(lessContentArray).join(';\n \n');
            return _context.abrupt('return', Promise.resolve(prettier.format(content, {
              parser: 'less'
            })));

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function loopAllLess(_x) {
    return _ref.apply(this, arguments);
  };
}();

module.exports = loopAllLess;