const postcss = require('postcss');
const syntax = require('postcss-less');
const uniqBy = require('lodash.uniqby');
const postcssUrl = require('postcss-url');

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

const getVariable = (lessPath, lessText) =>
  postcss([removeNoVarLessPlugin()])
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
