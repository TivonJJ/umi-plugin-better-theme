<!-- @format -->

# umi-plugin-better-theme

## Usage

Configure in `config/theme.config.json`,

```json
{
  "theme": [
    {
      "theme": "dark",
      "fileName": "dark.css"
    },
    {
      "fileName": "mingQing.css",
      "modifyVars": {
        "@primary-color": "#13C2C2"
      }
    }
  ],
  // 是否压缩css
  "min": true,
  // css module
  "isModule": true,
  // 忽略 antd 的依赖
  "ignoreAntd": false,
  // 忽略 pro-layout
  "ignoreProLayout": false,
  // 不使用缓存
  "cache": true,
  // 输出文件是否使用hash文件名
  "hash": true,
  // 公共样式，不会添加前缀
  "publicLessPath": "src/styles",
  // 启用的环境，不设置的情况下若头theme.config则所有环境都会执行
  "runEnv": "production"
}
```

you can get config in `window.umi_plugin_better_themeVar`

## LICENSE

MIT
