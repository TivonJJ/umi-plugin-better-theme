'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _require = require('path'),
    join = _require.join;

var buildCss = require('./merge-less');
var winPath = require('slash2');

var options = {
    "theme": [{
        "key": "purple",
        "fileName": "purple.css",
        "navTheme": "dark",
        "headerTheme": "light",
        "modifyVars": {
            "@primary-color": "#722ED1"
        }
    }],
    "publicLessPath": "src/styles/common",
    "hash": true
};

buildCss('D:/workspace/opensource/rubus', options.theme.map(function (theme) {
    return _extends({}, theme, {
        fileName: winPath(join('D:/workspace/opensource/rubus/out', 'theme', theme.fileName))
    });
}), _extends({
    min: true
}, options)).then(function () {
    console.log('🎊  build theme success');
}).catch(function (e) {
    console.log(e);
});