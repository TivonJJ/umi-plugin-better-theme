const { join } = require('path');
const buildCss = require('./merge-less');
const winPath = require('slash2');

const options = {
    "theme": [
        {
            "key": "purple",
            "fileName": "purple.css",
            "navTheme": "dark",
            "headerTheme": "light",
            "modifyVars": {
                "@primary-color": "#722ED1"
            }
        }
    ],
    "publicLessPath": "src/styles/common",
    "hash": true,
}

buildCss(
    'D:/workspace/opensource/rubus',
    options.theme.map(
        (theme) => ({
            ...theme,
            fileName: winPath(join('D:/workspace/opensource/rubus/out', 'theme', theme.fileName)),
        })),
    {
        min: true,
        ...options,
    },
)
    .then(() => {
        console.log('🎊  build theme success');
    })
    .catch((e) => {
        console.log(e);
    });
