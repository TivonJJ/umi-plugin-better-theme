'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (api) {
    var options = null;
    function getOptions() {
        var options = null;
        var themeConfigPath = winPath((0, _path.join)(api.paths.cwd, 'config/theme.config.json'));
        if ((0, _fs.existsSync)(themeConfigPath)) {
            options = require(themeConfigPath);
        }
        if (!options) return;
        options = _extends({ hash: true }, options);

        var matchEnv = true;
        if (options.runEnv) {
            if (Array.isArray(options.runEnv)) {
                matchEnv = options.runEnv.includes(process.env.NODE_ENV);
            } else {
                matchEnv = options.runEnv === process.env.NODE_ENV;
            }
        }
        if (!matchEnv) return null;
        options.theme.forEach(function (theme) {
            theme._fileName = theme.fileName;
            if (options.hash) {
                theme.fileName = getUid() + '.' + theme.fileName;
            }
        });
        api.logger.info('✿ Find theme.config.json');
        return options;
    }
    api.modifyDefaultConfig(function (config) {
        config.cssLoader = {
            modules: {
                getLocalIdent: function getLocalIdent(context, _, localName) {
                    if (context.resourcePath.includes('node_modules') || context.resourcePath.includes('ant.design.pro.less') || context.resourcePath.includes('global.less')) {
                        return localName;
                    }
                    var match = context.resourcePath.match(/src(.*)/);
                    if (match && match[1]) {
                        var antdProPath = match[1].replace('.less', '');
                        var arr = winPath(antdProPath).split('/').map(function (a) {
                            return a.replace(/([A-Z])/g, '-$1');
                        }).map(function (a) {
                            return a.toLowerCase();
                        });
                        return ('rubus' + arr.join('-') + '-' + localName).replace(/--/g, '-');
                    }
                    return localName;
                }
            }
        };
        return config;
    });
    var _api$paths = api.paths,
        cwd = _api$paths.cwd,
        absOutputPath = _api$paths.absOutputPath,
        absNodeModulesPath = _api$paths.absNodeModulesPath;

    var outputPath = absOutputPath;
    var themeTemp = winPath((0, _path.join)(absNodeModulesPath, '.plugin-theme'));

    function getUid() {
        return uuid.v1().split('-').pop();
    }

    // 增加中间件
    api.addMiddewares(function () {
        return (0, _serveStatic2.default)(themeTemp);
    });

    // 增加一个对象，用于 layout 的配合
    api.addHTMLHeadScripts(function () {
        options = getOptions();
        if (!options) return [];
        return [{
            content: 'window.umi_plugin_better_themeVar = ' + JSON.stringify(options.theme)
        }];
    });

    // 编译完成之后
    api.onBuildComplete(function (_ref) {
        var err = _ref.err;

        if (err) {
            return;
        }
        if (!options) return;
        api.logger.info('💄  build theme');

        try {
            if ((0, _fs.existsSync)(winPath((0, _path.join)(outputPath, 'theme')))) {
                _rimraf2.default.sync(winPath((0, _path.join)(outputPath, 'theme')));
            }
            (0, _fs.mkdirSync)(winPath((0, _path.join)(outputPath, 'theme')));
        } catch (error) {
            // console.log(error);
        }

        buildCss(cwd, options.theme.map(function (theme) {
            return _extends({}, theme, {
                fileName: winPath((0, _path.join)(outputPath, 'theme', theme.fileName))
            });
        }), _extends({
            min: true
        }, options)).then(function () {
            api.logger.log('🎊  build theme success');
        }).catch(function (e) {
            console.log(e);
        });
    });

    // dev 之后
    api.onDevCompileDone(function () {
        if (!options) return;
        api.logger.info('cache in :' + themeTemp);
        api.logger.info('💄  build theme');
        // 建立相关的临时文件夹
        try {
            if ((0, _fs.existsSync)(themeTemp)) {
                _rimraf2.default.sync(themeTemp);
            }
            if ((0, _fs.existsSync)(winPath((0, _path.join)(themeTemp, 'theme')))) {
                _rimraf2.default.sync(winPath((0, _path.join)(themeTemp, 'theme')));
            }

            (0, _fs.mkdirSync)(themeTemp);

            (0, _fs.mkdirSync)(winPath((0, _path.join)(themeTemp, 'theme')));
        } catch (error) {
            // console.log(error);
        }

        buildCss(cwd, options.theme.map(function (theme) {
            return _extends({}, theme, {
                fileName: winPath((0, _path.join)(themeTemp, 'theme', theme.fileName))
            });
        }), _extends({}, options)).then(function () {
            api.logger.log('🎊  build theme success');
        }).catch(function (e) {
            console.log(e);
        });
    });
};

var _path = require('path');

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var uuid = require('uuid');

var buildCss = require('./merge-less');
var winPath = require('slash2');