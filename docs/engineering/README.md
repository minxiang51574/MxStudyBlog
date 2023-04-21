# 一、前端工程化工程化

## 1、什么是前端工程化？
个人认为，一切有助于降低开发成本、提升开发体验、效率和质量的手段都属于工程化。前端工程化不等同于Webpack，它主要包含从编码、发布到运维的整个前端研发生命周期。

## 2、为什么要重视前端工程化？
随着前端技术的不断发展和变革，其业务逻辑逐渐变得复杂多样，企业对于前端的应用功能要求也跟着不断提高，例如优化开发流程，提高编码效率和质量，提高项目的可维护性...从一个项目搭建再到部署上线，这里面的每一个过程我们都可以通过前端工程化，提高工作效率。这也是为什么会要求员工会前端工程化的一个重要原因。

其次，前端工程化是前端开发人员的必备技能，从开发，规范，测试，lint，构建，部署，监控，集成，微服务等多个维度，以组合拳的形式，场景化的提升前端工程师的认知。

## 3、工程化四个维度
### 模块化
#### cjs (commonjs)
> 只能在 NodeJS 上运行，使用 require("module") 读取并加载模块
```js
exports.sum = (x, y) => x + y

const { sum } = require('./sum.js')
```

#### esm (es module)
> ESM — ECMAScript Module，ES6提出的标准模块系统 ，使用 import export 来管理依赖 ,将 bundle 保存为 ES 模块文件。适用于其他打包工具，在现代浏览器中用 `<script type=module>` 标签引入,package.json 添加 "type": "module" 来使用。
  
```js
  // sum.js
export const sum = (x, y) => x + y

// index.js
import { sum } from './sum'
```
由于 esm 为静态导入，正因如此，可在编译器进行 Tree Shaking，减少 js 体积
- cjs 模块输出的是一个值的拷贝，esm 输出的是值的引用
- cjs 模块是运行时加载，esm 是编译时加载

#### umd
> umd - amd和commonjs的统一规范，支持两种规范，即写一套代码，可用于多种场景；并且支持直接在前端用 <script src="lib.umd.js"></script> 的方式加载。
```js
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // 全局变量
    root.returnExports = factory(root.jQuery);
  }
}(this, function ($) {
  // ...
}));
```
### 组件化

### 规范化

### 自动化