const postcss = require('postcss');
const syntax = require('postcss-less');
const uniqBy = require('lodash.uniqby');
const postcssUrl = require('postcss-url');
const winPath = require('slash2');
const getHash = require('./getHash');
const path = require('path');

const fileNameList = [];

const removeNoVarLessPlugin = postcss.plugin('LocalIdentNamePlugin', () => less => {
  less.walkAtRules(atRule => {
    if (atRule.import) {
      atRule.remove();
    }
  });

  less.walkComments(decls => {
    decls.remove();
  });
});

const getVariable = (cwd,lessPath, lessText) =>
  postcss([removeNoVarLessPlugin()])
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
      result.messages = uniqBy(fileNameList);
      return result;
    });

module.exports = getVariable;
