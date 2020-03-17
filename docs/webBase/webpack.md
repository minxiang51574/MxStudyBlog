# webpack

## 概念
不像大多数的模块打包机，webpack是收把项目当作一个整体，通过一个给定的的主文件，webpack将从这个文件开始找到你的项目的所有依赖文件，使用loaders处理它们，最后打包成一个或多个浏览器可识别的js文件

## 主要构成
entry 、 output、Loader、Plugins

## entry
entry: 用来写入口文件，它将是整个依赖关系的根

## output
output: 即使入口文件有多个，但是只有一个输出配置

## Loader
loader的作用：
- 1、实现对不同格式的文件的处理，比如说将scss转换为css，或者typescript转化为js
- 2、转换这些文件，从而使其能够被添加到依赖图中
loader是webpack最重要的部分之一，通过使用不同的Loader，我们能够调用外部的脚本或者工具，实现对不同格式文件的处理，loader需要在webpack.config.js里边单独用module进行配置

babel-loader：让下一代的js文件转换成现代浏览器能够支持的JS文件
css-loader,style-loader:两个建议配合使用，用来解析css文件

## Plugins
plugins和loader很容易搞混，说都是外部引用有什么区别呢？ 事实上他们是两个完全不同的东西。这么说loaders负责的是处理源文件的如css、jsx，一次处理一个文件。而plugins并不是直接操作单个文件，它直接对整个构建过程起作用