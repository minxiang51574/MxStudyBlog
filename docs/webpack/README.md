# webpack
 
## 1.概念
webpack是一个模块打包工具，可以使用它管理项目中的模块依赖，并编译输出模块所需的静态文件。它可以很好地管理、打包开发中所用到的HTML,CSS,JavaScript和静态文件（图片，字体）等，让开发更高效。对于不同类型的依赖，webpack有对应的模块加载器，而且会分析模块间的依赖关系，最后合并生成优化的静态资源

## 2.打包原理
webpack是收把项目当作一个整体，通过一个给定的的主文件，webpack将从这个文件开始找到你的项目的所有依赖文件，使用loaders处理它们，将所有依赖打包成一个bundle.js，通过代码分割成单元片段按需加载

### 3.webpack的基本功能和工作原理？
- 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等等
- 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等
- 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载
- 模块合并：在采用模块化的项目有很多模块和文件，需要构建功能把模块分类合并成一个文件
- 自动刷新：监听本地源代码的变化，自动构建，刷新浏览器
- 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统

## 4.webpack构建过程
- 1.初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
- 2.开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
- 3.确定入口：根据配置中的 entry 找出所有的入口文件；
- 4.编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
- 5.完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
- 6.输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
- 7.输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
  
## 5.什么是loader，有哪些常见的Loader？他们是解决什么问题的？  
> loader实现对不同格式文件的处理;Loader的作用是让webpack拥有了加载和解析非JavaScript文件的能力
- 1.babel-loader 用babel来转换ES6文件到ES5
- 2.less-loader 处理less sass-loader 处理sass
- 3.css-loader,style-loader：解析css文件，能够解释@import url()等
- 4.url-loader：打包图片

## 6.什么是Plugin，有哪些常见的Plugin？他们是解决什么问题的？ 
> Plugin直译为"插件",Plugin可以扩展webpack的功能，让webpack具有更多的灵活性
- 1.commons-chunk-plugin：提取公共代码
- 2.uglifyjs-webpack-plugin：压缩js
- 3.optimize-css-assets-webpack-plugin:压缩css
- 4.extract-text-webpack-plugin该插件的主要是为了抽离css样式

## 7.如何利用webpack来优化前端性能？（提高性能和体验）
- 1.压缩代码。删除多余的代码、注释、简化代码的写法等等方式。可以利用webpack的UglifyJsPlugin和ParallelUglifyPlugin来压缩JS文件， 利用cssnano（css-loader?minimize）来压缩css
- 2.提取公共代码
- 3.使用Tree Shaking剔除JS死代码
- 4.缓存


