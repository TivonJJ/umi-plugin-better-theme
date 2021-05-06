'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var postcss = require('postcss');
var syntax = require('postcss-less');
var path = require('path');
var uniqBy = require('lodash.uniqby');
var genRule = require('./genRule');
var getLocalIdentName = require('./getLocalIdentName');
var winPath = require('slash2');
var postcssUrl = require('postcss-url');
var getHash = require('./getHash');

/**
 * 便利所有的规则
 * 删除 import
 * 并且返回需要的样式
 * @param {*} less
 * @param {*} callback
 */
var walkRules = function walkRules(less, callback) {
    var fileNameList = [];
    less.walkAtRules(function (atRule) {
        if (atRule.import) {
            var filename = atRule.params;
            if (!filename.includes('style/mixins') && !filename.includes('style/themes') && !filename.includes('themes/index') && !filename.includes('color/colors') && !filename.includes('./index') && !filename.includes('index.css')) {
                var importFile = String(atRule.params);
                fileNameList.push(path.join(path.dirname(less.source.input.file), importFile.substring(1, importFile.length - 1)));
            }
            atRule.remove();
        }
    });
    less.walkRules(function (rule) {
        if (rule.parent.type !== 'atrule' || !/keyframes$/.test(rule.parent.name)) {
            if (rule.selector.indexOf('(') === -1 || rule.selector.includes(':global(')) {
                callback(rule);
            }
        }
    });
    var lessFile = less.source.input.file.split('src/')[1];
    less.prepend(postcss.comment({ text: '\n  Convert to from  src/' + lessFile + '\n' }));
    return fileNameList;
};

var LocalIdentNamePlugin = postcss.plugin('LocalIdentNamePlugin', function (options) {
    return function (less, result) {
        var fileNameList = walkRules(less, function (rule) {
            if (options.isModule === false) {
                return;
            }
            genRule(rule, options, result);
        });
        result.messages = fileNameList;
    };
});

var AddLocalIdentName = function AddLocalIdentName(cwd, lessPath, lessText, isModule, publicLessPath) {
    var isPublicLess = function () {
        if (!publicLessPath) return false;
        if (Array.isArray(publicLessPath)) {
            return publicLessPath.find(function (lp) {
                return lessPath.startsWith(winPath(path.join(process.cwd(), lp)));
            });
        }
        return lessPath.startsWith(winPath(path.join(process.cwd(), publicLessPath)));
    }();
    return postcss([LocalIdentNamePlugin({
        isModule: isPublicLess ? false : isModule,
        generateScopedName: function generateScopedName(className) {
            if (!isModule || isPublicLess) {
                return className;
            }
            return getLocalIdentName(lessPath) + className;
        }
    })]).use(postcssUrl({
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
        result.messages = {
            name: lessPath,
            fileList: [].concat(_toConsumableArray(uniqBy(result.messages)))
        };
        return result;
    });
};

module.exports = AddLocalIdentName;