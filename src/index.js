import {join} from 'path';
import serveStatic from 'serve-static';
import rimraf from 'rimraf';
import {existsSync, mkdirSync} from 'fs';

const uuid = require('uuid');

const buildCss = require('./merge-less');
const winPath = require('slash2');

export default function (api) {
    function getOptions(){
        let options = null;
        const themeConfigPath = winPath(join(api.paths.cwd, 'config/theme.config.json'));
        if (existsSync(themeConfigPath)) {
            options = require(themeConfigPath);
        }
        if (!options) return;
        options = {hash: true, ...options}

        let matchEnv = true;
        if (options.runEnv) {
            if(Array.isArray(options.runEnv)){
                matchEnv = options.runEnv.includes(process.env.NODE_ENV)
            }else {
                matchEnv = options.runEnv === process.env.NODE_ENV
            }
        }
        if(!matchEnv)return null;
        options.theme.forEach((theme) => {
            theme._fileName = theme.fileName;
            if (options.hash) {
                theme.fileName = getUid() + '.' + theme.fileName;
            }
        })
        api.logger.info('✿ Find theme.config.json')
        return options;
    }
    api.modifyDefaultConfig((config) => {
        config.cssLoader = {
            modules: {
                getLocalIdent: (
                    context,
                    _,
                    localName,
                ) => {
                    if (
                        context.resourcePath.includes('node_modules') ||
                        context.resourcePath.includes('ant.design.pro.less') ||
                        context.resourcePath.includes('global.less')
                    ) {
                        return localName;
                    }
                    const match = context.resourcePath.match(/src(.*)/);
                    if (match && match[1]) {
                        const antdProPath = match[1].replace('.less', '');
                        const arr = winPath(antdProPath)
                            .split('/')
                            .map((a) => a.replace(/([A-Z])/g, '-$1'))
                            .map((a) => a.toLowerCase());
                        return `rubus${arr.join('-')}-${localName}`.replace(/--/g, '-');
                    }
                    return localName;
                },
            },
        };
        return config;
    });
    const {cwd, absOutputPath, absNodeModulesPath} = api.paths;
    const outputPath = absOutputPath;
    const themeTemp = winPath(join(absNodeModulesPath, '.plugin-theme'));

    function getUid() {
        return uuid.v1().split('-').pop();
    }

    // 增加中间件
    api.addMiddewares(() => {
        return serveStatic(themeTemp);
    });

    // 增加一个对象，用于 layout 的配合
    api.addHTMLHeadScripts(() => [
        {
            content: `window.umi_plugin_better_themeVar = ${JSON.stringify(options.theme)}`,
        },
    ]);

    // 编译完成之后
    api.onBuildComplete(({err}) => {
        if (err) {
            return;
        }
        const options = getOptions();
        if(!options)return;
        api.logger.info('💄  build theme');

        try {
            if (existsSync(winPath(join(outputPath, 'theme')))) {
                rimraf.sync(winPath(join(outputPath, 'theme')));
            }
            mkdirSync(winPath(join(outputPath, 'theme')));
        } catch (error) {
            // console.log(error);
        }

        buildCss(
            cwd,
            options.theme.map(
                (theme) => ({
                    ...theme,
                    fileName: winPath(join(outputPath, 'theme', theme.fileName)),
                })),
            {
                min: true,
                ...options,
            },
        )
            .then(() => {
                api.logger.log('🎊  build theme success');
            })
            .catch((e) => {
                console.log(e);
            });
    });

    // dev 之后
    api.onDevCompileDone(() => {
        const options = getOptions();
        if(!options)return;
        api.logger.info('cache in :' + themeTemp);
        api.logger.info('💄  build theme');
        // 建立相关的临时文件夹
        try {
            if (existsSync(themeTemp)) {
                rimraf.sync(themeTemp);
            }
            if (existsSync(winPath(join(themeTemp, 'theme')))) {
                rimraf.sync(winPath(join(themeTemp, 'theme')));
            }

            mkdirSync(themeTemp);

            mkdirSync(winPath(join(themeTemp, 'theme')));
        } catch (error) {
            // console.log(error);
        }

        buildCss(
            cwd,
            options.theme.map((theme) => ({
                ...theme,
                fileName: winPath(join(themeTemp, 'theme', theme.fileName)),
            })),
            {
                ...options,
            },
        )
            .then(() => {
                api.logger.log('🎊  build theme success');
            })
            .catch((e) => {
                console.log(e);
            });
    });
}
