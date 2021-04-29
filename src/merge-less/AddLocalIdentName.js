const postcss = require('postcss');
const syntax = require('postcss-less');
const path = require('path');
const uniqBy = require('lodash.uniqby');
const genRule = require('./genRule');
const getLocalIdentName = require('./getLocalIdentName');
const winPath = require('slash2');
const postcssUrl = require('postcss-url');
const getHash = require('./getHash');

/**
 * 便利所有的规则
 * 删除 import
 * 并且返回需要的样式
 * @param {*} less
 * @param {*} callback
 */
const walkRules = (less, callback) => {
  const fileNameList = [];
  less.walkAtRules(atRule => {
    if (atRule.import) {
      const filename = atRule.params;
      if (
        !filename.includes('style/mixins') &&
        !filename.includes('style/themes') &&
        !filename.includes('themes/index') &&
        !filename.includes('color/colors') &&
        !filename.includes('./index') &&
        !filename.includes('index.css')
      ) {
        const importFile = String(atRule.params);
        fileNameList.push(
          path.join(
            path.dirname(less.source.input.file),
            importFile.substring(1, importFile.length - 1),
          ),
        );
      }
      atRule.remove();
    }
  });
  less.walkRules(rule => {
    if (rule.parent.type !== 'atrule' || !/keyframes$/.test(rule.parent.name)) {
      if (rule.selector.indexOf('(') === -1 || rule.selector.includes(':global(')) {
        callback(rule);
      }
    }
  });
  const lessFile = less.source.input.file.split('src/')[1];
  less.prepend(postcss.comment({ text: `\n  Convert to from  src/${lessFile}\n` }));
  return fileNameList;
};

const LocalIdentNamePlugin = postcss.plugin('LocalIdentNamePlugin', options => (less, result) => {
  const fileNameList = walkRules(less, rule => {
    if (options.isModule === false) {
      return;
    }
    genRule(rule, options, result);
  });
  result.messages = fileNameList;
});

const AddLocalIdentName = (cwd,lessPath, lessText, isModule, publicLessPath) => {
    const isPublicLess = (()=>{
        if(!publicLessPath)return false;
        if(Array.isArray(publicLessPath)){
            return publicLessPath.find(lp=>lessPath.startsWith(winPath(path.join(process.cwd(),lp))))
        }
        return lessPath.startsWith(winPath(path.join(process.cwd(),publicLessPath)));
    })()
    return postcss([
        LocalIdentNamePlugin({
            isModule: isPublicLess ? false : isModule,
            generateScopedName: className => {
                if (!isModule || isPublicLess) {
                    return className;
                }
                return getLocalIdentName(lessPath) + className;
            },
        }),
    ])
        .use(postcssUrl({
            url: (assets)=>{
                if(/^~@/.test(assets.url)){
                    const absPath = path.join(cwd,'src',assets.url.replace(/^~@/,''))
                    const hash = getHash(absPath)
                    const en = path.extname(assets.url);
                    const bn = path.basename(assets.url,en);
                    return winPath(path.join('../static/',bn+'.'+hash+en));
                }
                return assets.url;
            }
        }))
        .use(postcssUrl({
            url: 'inline'
        }))
        .process(lessText, {
            from: lessPath,
            syntax,
        })
        .then(result => {
            // eslint-disable-next-line no-param-reassign
            result.messages = {
                name: lessPath,
                fileList: [...uniqBy(result.messages)],
            };
            return result;
        });
}

module.exports = AddLocalIdentName;
