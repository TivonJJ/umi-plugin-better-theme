#!/usr/bin/env node

/**
 * 这个方法用来处理 css-module
 * 由于没有开源插件，所以自己撸了一个
 */
const glob = require('glob');
const uniqBy = require('lodash.uniqby');
const { winPath } = require('umi-utils');
const path = require('path');
const minimatch = require('minimatch');

const AddLocalIdentName = require('./AddLocalIdentName');
const replaceDefaultLess = require('./replaceDefaultLess');
const lessOrder = require('./lessOrder');

// read less file list
const genModuleLess = (parents, { isModule, filterFileLess, publicLessPath }) => {
  let lessArray = [];
  const promiseList = [];
  lessArray = [];
  glob
    .sync(winPath(`${parents}/**/**.less`))
    .sort((a, b) => lessOrder(a) - lessOrder(b))
    .filter(filePath => {
        const relativePath = path.relative(parents,filePath)
        const ignore = ['**/node_modules/**', '**/dist/**', '**/es/**', '**/lib/**', '**/_site/**'];
        if(minimatch(relativePath,...ignore)){
            return false;
        }
      if (
        filePath.includes('ant.design.pro.less') ||
        filePath.includes('global.less') ||
        filePath.includes('bezierEasing.less') ||
        filePath.includes('colorPalette.less') ||
        filePath.includes('tinyColor.less')
      ) {
        return false;
      }
      if (filterFileLess) {
        return filterFileLess(filePath);
      }
      return true;
    })
    .forEach(realPath => {
      // post css add localIdentNamePlugin
      const fileContent = replaceDefaultLess(realPath);
      promiseList.push(AddLocalIdentName(parents,realPath, fileContent, isModule, publicLessPath));
    });

  return Promise.all(promiseList).then(content => {
    let allFileList = [];
    content.map(item => {
      const { fileList, name } = item.messages;
      allFileList = allFileList.concat([name, ...fileList]);
      return item;
    });
    const fileString = uniqBy(allFileList).join('-');
    return lessArray
      .concat(
        content.sort((a, b) => {
          const aName = a.messages.name;
          const bName = b.messages.name;
          if (aName.includes('v2-compatible-reset')) {
            return 1;
          }
          if (bName.includes('v2-compatible-reset')) {
            return -1;
          }
          return fileString.indexOf(aName) - fileString.indexOf(bName);
        }),
      )
      .join('\n');
  });
};

module.exports = genModuleLess;
