'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/** @format */

var fs = require('fs');
var path = require('path');
var less = require('less');
var rimraf = require('rimraf');
var uglifycss = require('uglifycss');
var defaultDarkTheme = require('@ant-design/dark-theme');

var _require = require('umi-utils'),
    winPath = _require.winPath;

var genModuleLess = require('./genModuleLess');
var getVariable = require('./getVariable');
var loopAllLess = require('./loopAllLess');

var _require2 = require('../util'),
    genHashCode = _require2.genHashCode;

var darkTheme = _extends({}, defaultDarkTheme.default, {
  dark: true,
  '@white': '#fff',
  '@light': '#fff',
  '@text-color': 'fade(@white, 65%)',
  '@heading-color': 'fade(@white, 85%)',
  // 移动
  '@screen-sm': '767.9px',
  // 超小屏
  '@screen-xs': '375px',

  // 官网
  '@site-text-color': '@text-color',
  '@site-border-color-split': 'fade(@light, 5)',
  '@site-heading-color': '@heading-color',
  '@site-header-box-shadow': '0 0.3px 0.9px rgba(0, 0, 0, 0.12), 0 1.6px 3.6px rgba(0, 0, 0, 0.12)',
  '@home-text-color': '@text-color',

  // 自定义需要找设计师
  '@gray-8': '@text-color',
  '@background-color-base': '#555',

  // pro
  '@pro-header-box-shadow': '@site-header-box-shadow'
});

var tempPath = winPath(path.join(__dirname, './.temp/'));

var loadAntd = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(ignoreAntd, _ref2) {
    var _ref2$dark = _ref2.dark,
        dark = _ref2$dark === undefined ? false : _ref2$dark,
        _ref2$compact = _ref2.compact,
        compact = _ref2$compact === undefined ? false : _ref2$compact;
    var ignoreFiles, antdPath;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!ignoreAntd) {
              _context.next = 4;
              break;
            }

            fs.writeFileSync(path.join(tempPath, './antd.less'), '@import \'../color/bezierEasing\';\n      @import \'../color/colorPalette\';\n      @import "../color/tinyColor";\n          ');
            return _context.abrupt('return', false);

          case 4:
            ignoreFiles = [];

            if (!dark) {
              ignoreFiles.push('themes/dark.less');
            }
            if (!compact) {
              ignoreFiles.push('themes/compact.less');
            }
            antdPath = require.resolve('antd');

            if (!fs.existsSync(antdPath)) {
              _context.next = 12;
              break;
            }

            _context.next = 11;
            return loopAllLess(path.resolve(path.join(antdPath, '../../es/')), ignoreFiles).then(function (content) {
              fs.writeFileSync(path.join(tempPath, './antd.less'), '@import \'../color/bezierEasing\';\n@import \'../color/colorPalette\';\n@import "../color/tinyColor";\n      ' + content + '\n            ');
            });

          case 11:
            return _context.abrupt('return', true);

          case 12:
            _context.next = 17;
            break;

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](0);

            console.log(_context.t0);

          case 17:

            fs.writeFileSync(path.join(tempPath, './antd.less'), '@import \'../color/bezierEasing\';\n@import \'../color/colorPalette\';\n@import "../color/tinyColor";\n    ');
            return _context.abrupt('return', false);

          case 19:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 14]]);
  }));

  return function loadAntd(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var loadLibraryComponents = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4) {
    var filterFileLess = _ref4.filterFileLess,
        _ref4$extraLibraries = _ref4.extraLibraries,
        extraLibraries = _ref4$extraLibraries === undefined ? [] : _ref4$extraLibraries;
    var components, jobs, contentList;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            components = ['@ant-design/pro-layout', '@ant-design/pro-table'].concat(_toConsumableArray(extraLibraries));
            _context2.prev = 1;

            if (!components) {
              _context2.next = 9;
              break;
            }

            jobs = [];

            components.forEach(function (item) {
              if (filterFileLess && !filterFileLess(item)) {
                return;
              }
              var componentPath = require.resolve(item);
              if (fs.existsSync(componentPath)) {
                jobs.push(loopAllLess(path.resolve(path.join(componentPath, '../../es/')), []));
              }
            });
            _context2.next = 7;
            return Promise.all(jobs);

          case 7:
            contentList = _context2.sent;

            fs.writeFileSync(path.join(tempPath, '/components.less'), '@import \'./antd\';\n' + contentList.join('\n') + '\n    ');

          case 9:
            _context2.next = 14;
            break;

          case 11:
            _context2.prev = 11;
            _context2.t0 = _context2['catch'](1);

            fs.writeFileSync(path.join(tempPath, '/components.less'), "@import './antd';");

          case 14:

            fs.writeFileSync(path.join(tempPath, '/layout.less'), "@import './antd';");
            return _context2.abrupt('return', false);

          case 16:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[1, 11]]);
  }));

  return function loadLibraryComponents(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var getModifyVars = function getModifyVars() {
  var theme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'light';
  var modifyVars = arguments[1];
  var disableExtendsDark = arguments[2];

  try {
    if (theme === 'dark') {
      return _extends({}, disableExtendsDark ? {} : darkTheme, modifyVars);
    }
    return _extends({ dark: false }, modifyVars);
  } catch (error) {
    throw error;
  }
};

var getOldFile = function getOldFile(filePath) {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath);
  }
  return false;
};

var isEqual = false;

var genProjectLess = function genProjectLess(filePath, _ref5) {
  var isModule = _ref5.isModule,
      publicLessPath = _ref5.publicLessPath,
      loadAny = _ref5.loadAny,
      cache = _ref5.cache,
      ignoreAntd = _ref5.ignoreAntd,
      ignoreProLayout = _ref5.ignoreProLayout,
      rest = _objectWithoutProperties(_ref5, ['isModule', 'publicLessPath', 'loadAny', 'cache', 'ignoreAntd', 'ignoreProLayout']);

  return genModuleLess(filePath, _extends({ isModule: isModule, publicLessPath: publicLessPath }, rest)).then(function () {
    var _ref6 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(content) {
      var tempFilePath, newFileHash, oldFileHash, lessContent;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (cache === false) {
                rimraf.sync(tempPath);
              }
              if (!fs.existsSync(tempPath)) {
                fs.mkdirSync(tempPath);
              }

              tempFilePath = winPath(path.join(tempPath, 'temp.less'));

              // 获取新旧文件的 hash

              newFileHash = genHashCode(content);
              oldFileHash = genHashCode(getOldFile(tempFilePath));

              if (!(newFileHash === oldFileHash)) {
                _context3.next = 8;
                break;
              }

              isEqual = true;
              // 无需重复生成
              return _context3.abrupt('return', false);

            case 8:

              fs.writeFileSync(tempFilePath, content);

              _context3.prev = 9;

              if (!loadAny) {
                _context3.next = 14;
                break;
              }

              fs.writeFileSync(winPath(path.join(tempPath, 'pro.less')), '@import \'./components\';\n           ' + content);
              _context3.next = 18;
              break;

            case 14:
              _context3.next = 16;
              return getVariable(filePath, tempFilePath, fs.readFileSync(tempFilePath), loadAny).then(function (result) {
                return result.content.toString();
              });

            case 16:
              lessContent = _context3.sent;


              fs.writeFileSync(winPath(path.join(tempPath, 'pro.less')), '@import \'./components\';\n           ' + lessContent);

            case 18:
              _context3.next = 23;
              break;

            case 20:
              _context3.prev = 20;
              _context3.t0 = _context3['catch'](9);

              console.log(_context3.t0.name, _context3.t0.file, 'line: ' + _context3.t0.line);

            case 23:
              _context3.next = 25;
              return loadLibraryComponents(rest);

            case 25:
              return _context3.abrupt('return', true);

            case 26:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined, [[9, 20]]);
    }));

    return function (_x5) {
      return _ref6.apply(this, arguments);
    };
  }());
};

var modifyVarsArrayPath = path.join(tempPath, 'modifyVarsArray.json');

var modifyVarsIsEqual = function modifyVarsIsEqual() {
  var modifyVarsArray = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var modifyVarsArrayString = JSON.stringify(modifyVarsArray);

  var old = getOldFile(modifyVarsArrayPath);
  if (old && genHashCode(old) === genHashCode(modifyVarsArrayString) && isEqual) {
    console.log('📸  less and modifyVarsArray is equal!');
    return true;
  }

  return false;
};

var renderLess = function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    var theme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'light';
    var modifyVars = arguments[1];
    var _ref8 = arguments[2];
    var _ref8$min = _ref8.min,
        min = _ref8$min === undefined ? true : _ref8$min,
        _ref8$ignoreAntd = _ref8.ignoreAntd,
        ignoreAntd = _ref8$ignoreAntd === undefined ? false : _ref8$ignoreAntd,
        _ref8$disableExtendsD = _ref8.disableExtendsDark,
        disableExtendsDark = _ref8$disableExtendsD === undefined ? false : _ref8$disableExtendsD;
    var proLess, myModifyVars;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            proLess = winPath(path.join(tempPath, './pro.less'));

            if (fs.existsSync(proLess)) {
              _context4.next = 3;
              break;
            }

            return _context4.abrupt('return', '');

          case 3:
            myModifyVars = getModifyVars(theme || 'light', modifyVars, disableExtendsDark);
            _context4.next = 6;
            return loadAntd(ignoreAntd, {
              dark: myModifyVars.dark,
              compact: myModifyVars.compact
            });

          case 6:
            return _context4.abrupt('return', less.render(fs.readFileSync(proLess, 'utf-8'), {
              modifyVars: myModifyVars,
              javascriptEnabled: true,
              filename: path.resolve(proLess)
            })
            // 如果需要压缩，再打开压缩功能默认打开
            .then(function (out) {
              return min ? uglifycss.processString(out.css) : out.css;
            }).catch(function (e) {
              console.log(e);
            }));

          case 7:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function renderLess() {
    return _ref7.apply(this, arguments);
  };
}();

var build = function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee6(cwd, modifyVarsArray) {
    var propsOption = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { isModule: true, loadAny: false, cache: true };
    var defaultOption, option, needBuild, loop;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            console.log('🔩 less render start!');
            isEqual = false;
            defaultOption = { isModule: true, cache: true };
            option = _extends({}, defaultOption, propsOption);
            _context6.prev = 4;
            _context6.next = 7;
            return genProjectLess(cwd, option);

          case 7:
            needBuild = _context6.sent;

            if (!(!needBuild && modifyVarsIsEqual(modifyVarsArray))) {
              _context6.next = 11;
              break;
            }

            console.log('🎩 less render end!');
            return _context6.abrupt('return');

          case 11:
            loop = function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5(index) {
                var _modifyVarsArray$inde, theme, modifyVars, fileName, disableExtendsDark, css;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        if (modifyVarsArray[index]) {
                          _context5.next = 2;
                          break;
                        }

                        return _context5.abrupt('return', false);

                      case 2:
                        _modifyVarsArray$inde = modifyVarsArray[index], theme = _modifyVarsArray$inde.theme, modifyVars = _modifyVarsArray$inde.modifyVars, fileName = _modifyVarsArray$inde.fileName, disableExtendsDark = _modifyVarsArray$inde.disableExtendsDark;
                        _context5.prev = 3;
                        _context5.next = 6;
                        return renderLess(theme, modifyVars, _extends({}, option, {
                          disableExtendsDark: disableExtendsDark
                        }));

                      case 6:
                        css = _context5.sent;

                        fs.writeFileSync(fileName, css);
                        // 写入缓存的变量值设置
                        fs.writeFileSync(modifyVarsArrayPath, JSON.stringify(modifyVars || {}));
                        _context5.next = 14;
                        break;

                      case 11:
                        _context5.prev = 11;
                        _context5.t0 = _context5['catch'](3);

                        console.log(_context5.t0);

                      case 14:
                        if (!(index < modifyVarsArray.length)) {
                          _context5.next = 18;
                          break;
                        }

                        _context5.next = 17;
                        return loop(index + 1);

                      case 17:
                        return _context5.abrupt('return', true);

                      case 18:
                        return _context5.abrupt('return', true);

                      case 19:
                      case 'end':
                        return _context5.stop();
                    }
                  }
                }, _callee5, undefined, [[3, 11]]);
              }));

              return function loop(_x11) {
                return _ref10.apply(this, arguments);
              };
            }();
            // 写入缓存的变量值设置


            fs.writeFileSync(modifyVarsArrayPath, JSON.stringify(modifyVarsArray));
            _context6.next = 15;
            return loop(0);

          case 15:
            console.log('🎩 less render end!');
            _context6.next = 21;
            break;

          case 18:
            _context6.prev = 18;
            _context6.t0 = _context6['catch'](4);

            console.log(_context6.t0);

          case 21:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, undefined, [[4, 18]]);
  }));

  return function build(_x8, _x9) {
    return _ref9.apply(this, arguments);
  };
}();

module.exports = build;