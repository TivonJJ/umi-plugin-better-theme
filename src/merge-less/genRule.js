'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Tokenizer = require('css-selector-tokenizer');
var genericNames = require('generic-names');

var trimNodes = function trimNodes(nodes) {
  var firstIndex = nodes.findIndex(function (node) {
    return node.type !== 'spacing';
  });
  var lastIndex = nodes.slice().reverse().findIndex(function (node) {
    return node.type !== 'spacing';
  });
  return nodes.slice(firstIndex, nodes.length - lastIndex);
};

var isSpacing = function isSpacing(node) {
  return node.type === 'spacing' || node.type === 'operator';
};

var isModifier = function isModifier(node) {
  return node.type === 'pseudo-class' && (node.name === 'local' || node.name === 'global');
};

/**
 * 为 选择器增加前缀
 * @param {*} node
 * @param {*} param1
 */
function localizeNode(node, _ref) {
  var mode = _ref.mode,
      inside = _ref.inside,
      getAlias = _ref.getAlias;

  var newNodes = node.nodes.reduce(function (acc, n, index, nodes) {
    switch (n.type) {
      case 'spacing':
        if (isModifier(nodes[index + 1])) {
          return [].concat(_toConsumableArray(acc), [Object.assign({}, n, { value: '' })]);
        }
        return [].concat(_toConsumableArray(acc), [n]);

      case 'operator':
        if (isModifier(nodes[index + 1])) {
          return [].concat(_toConsumableArray(acc), [Object.assign({}, n, { after: '' })]);
        }
        return [].concat(_toConsumableArray(acc), [n]);

      case 'pseudo-class':
        if (isModifier(n)) {
          if (inside) {
            throw Error('A :' + n.name + ' is not allowed inside of a :' + inside + '(...)');
          }
          if (index !== 0 && !isSpacing(nodes[index - 1])) {
            throw Error('Missing whitespace before :' + n.name);
          }
          if (index !== nodes.length - 1 && !isSpacing(nodes[index + 1])) {
            throw Error('Missing whitespace after :' + n.name);
          }
          // set mode
          mode = n.name;
          return acc;
        }
        return [].concat(_toConsumableArray(acc), [n]);

      case 'nested-pseudo-class':
        if (n.name === 'local' || n.name === 'global') {
          if (inside) {
            throw Error('A :' + n.name + '(...) is not allowed inside of a :' + inside + '(...)');
          }
          return [].concat(_toConsumableArray(acc), _toConsumableArray(localizeNode(n.nodes[0], {
            mode: n.name,
            inside: n.name,
            getAlias: getAlias
          }).nodes));
        }
        return [].concat(_toConsumableArray(acc), [Object.assign({}, n, {
          nodes: localizeNode(n.nodes[0], { mode: mode, inside: inside, getAlias: getAlias }).nodes
        })]);

      case 'id':
      case 'class':
        if (mode === 'local') {
          return [].concat(_toConsumableArray(acc), [Object.assign({}, n, { name: getAlias(n.name) })]);
        }
        return [].concat(_toConsumableArray(acc), [n]);

      default:
        return [].concat(_toConsumableArray(acc), [n]);
    }
  }, []);

  return Object.assign({}, node, { nodes: trimNodes(newNodes) });
}

var localizeSelectors = function localizeSelectors(selectors, mode, getAlias) {
  var node = Tokenizer.parse(selectors);
  return Tokenizer.stringify(Object.assign({}, node, {
    nodes: node.nodes.map(function (n) {
      return localizeNode(n, { mode: mode, getAlias: getAlias });
    })
  }));
};

var getValue = function getValue(messages, name) {
  return messages.find(function (msg) {
    return msg.type === 'icss-value' && msg.value === name;
  });
};

var isRedeclared = function isRedeclared(messages, name) {
  return messages.find(function (msg) {
    return msg.type === 'icss-scoped' && msg.name === name;
  });
};

var genRule = function genRule(rule, options, result) {
  var generateScopedName = options.generateScopedName || genericNames('[name]__[local]---[hash:base64:5]');
  var aliases = {};
  var getAlias = function getAlias(name) {
    if (aliases[name]) {
      return aliases[name];
    }
    // icss-value contract
    var valueMsg = getValue(result.messages, name);
    if (valueMsg) {
      aliases[valueMsg.name] = name;
      return name;
    }
    var alias = generateScopedName(name);
    aliases[name] = alias;
    // icss-scoped contract
    if (isRedeclared(result.messages, name)) {
      result.warn('\'' + name + '\' already declared', { node: rule });
    }
    return alias;
  };
  try {
    // 如果为 less mixin  variable  params 不需要处理
    var selector = localizeSelectors(rule.selector, options.mode === 'global' ? 'global' : 'local', getAlias);
    if (selector) {
      if (selector.includes(':global(')) {
        // converted :global(.className）
        var className = selector.match(/:global\((\S*)\)/)[1];
        rule.selector = className;
      } else {
        rule.selector = selector;
      }
      rule.selector = selector;
    } else {
      // selector 为空，说明是个 :global{}
      // 从他的父节点中删除他，并且插入他的子节点
      // 这个写法是因为 css 与 less 的不同导致的，
      // 因为 css 下会是 :golbal .classname,但是 less 是 :golbal{.classname}
      // 直接 selector 删除会出现问题
      rule.replaceWith(rule.nodes);
      return;
    }
  } catch (e) {
    throw rule.error(e.message);
  }
};

module.exports = genRule;