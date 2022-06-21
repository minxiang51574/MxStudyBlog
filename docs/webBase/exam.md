# 面试题

## HTML
- 1、语义化
- 2、新标签新特性
- 3、input和textarea的区别
- 4、用一个div模拟textarea的实现
- 5、移动设备忽略将页面中的数字识别为电话号码的方法

## CSS
- 1、盒模型
- 2、flex
- 3、css单位
- 4、css选择器
- 5、bfc 清除浮动
- 6、层叠上下文
- 7、常见页面布局
- 8、响应式布局
- 9、css预处理，后处理
- 10、css3新特性
  - animation和transiton的相关属性
  - animate和translate  
- 11、display哪些取值 
- 12、相邻的两个inline-block节点为什么会出现间隔，该如何解决
- 13、meta viewport 移动端适配
- 14、CSS实现宽度自适应100%，宽高16:9的比例的矩形
- 15、rem布局的优缺点
- 16、画三角形
- 17、1像素边框问题

### JS
- 1、原型/原型链/构造函数/实例/继承
- 2、有几种方式可以实现继承
- 3、用原型实现继承有什么缺点，怎么解决
- 4、arguments
- 5、数据类型判断
- 6、作用域链、闭包、作用域
- 7、Ajax的原生写法
- 8、对象深拷贝、浅拷贝
- 9、图片懒加载、预加载
- 10、实现页面加载进度条
- 11、this关键字
- 12、函数式编程
- 13、手动实现parseInt
- 14、为什么会有同源策略
- 15、怎么判断两个对象是否相等
- 16、事件模型
  - 事件委托、代理
  - 如何让事件先冒泡后捕获
- 17、window的onload事件和domcontentloaded
- 18、for...in迭代和for...of有什么区别
- 19、函数柯里化
- 20、call apply区别，原生实现bind
  - call，apply，bind 三者用法和区别：角度可为参数、绑定规则（显示绑定和强绑定），运行效率、运行情况
- 21、async/await
- 22、立即执行函数和使用场景
- 23、设计模式(要求说出如何实现,应用,优缺点)/单例模式实现
- 24、iframe的缺点有哪些
- 25、数组问题
  - 数组去重
  - 数组常用方法
  - 查找数组重复项
  - 扁平化数组
  - 按数组中各项和特定值差值排序
- 26、BOM属性对象方法
- 27、服务端渲染
- 28、垃圾回收机制
- 29、eventloop
  - 进程和线程
  - 任务队列
- 30、如何快速让字符串变成已千为精度的数字

### ES6
- 1、声明 let、const
- 2、解构赋值
- 3、声明类与继承：class、extend
- 4、Promise的使用与实现
- 5、generator（异步编程、yield、next()、await 、async）
- 6、箭头函数this指向问题、拓展运算符
- 7、map和set有没有用过，如何实现一个数组去重，map数据结构有什么优点?
- 8、ES6怎么编译成ES5,css-loader原理,过程
- 9、ES6转成ES5的常见例子
  - 使用es5实现es6的class

### 浏览器
- 1、输入url到展示页面过程发生了什么
- 2、重绘与回流
  - 重绘(repaint): 当元素样式的改变不影响布局时，浏览器将使用重绘对元素进行更新，此时由于只需要UI层面的重新像素绘制，因此 损耗较少
  - 回流(reflow): 当元素的尺寸、结构或触发某些属性时，浏览器会重新渲染页面，称为回流。此时，浏览器需要重新经过计算，计算后还需要重新页面布局，因此是较重的操作。会触发回流的操作:
    * 页面初次渲染
    * 浏览器窗口大小改变
    * 元素尺寸、位置、内容发生改变
    * 元素字体大小变化
    * 添加或者删除可见的 dom 元素
    * 激活 CSS 伪类（例如：:hover）
    * 查询某些属性或调用某些方法
    * clientWidth、clientHeight、clientTop、clientLeft
    * offsetWidth、offsetHeight、offsetTop、offsetLeft
    * scrollWidth、scrollHeight、scrollTop、scrollLeft
    * getComputedStyle()
    * getBoundingClientRect()
    * scrollTo()
    回流必定触发重绘，重绘不一定触发回流。重绘的开销较小，回流的代价较高
- 3、防抖与节流
- 4、cookies、session、sessionStorage、localStorage
- 5、浏览器内核 

### 服务端与网络
- 1、常见状态码
- 2、缓存
- 3、cookie, session, token
- 4、前端持久化的方式、区别
- 5、DNS是怎么解析的
- 6、cdn
- 7、计算机网络的相关协议
- 8、http/https/http2.0
- 9、get post区别
- 10、ajax、 axios库
- 11、tcp三次握手，四次挥手流程
- 12、跨域
- 13、前端安全XSS、CSRF
- 14、websocket
- 15、Http请求中的keep-alive有了解吗
- 16、网络分层
- 17、即时通信，除了Ajax和websocket
- 18、模块化，commonJS，es6，cmd，amd

### Vue
- 1、vue解决了什么问题
- 2、MVVM的理解
- 3、如何实现一个自定义组件，不同组件之间如何通信的？
- 4、nextTick
- 5、生命周期
- 6、虚拟dom的原理
- 7、双向绑定的原理？数据劫持？
- 8、组件通信
  - 父->子
  - 子->父
  - 非父子组件
- 9、Proxy 相比于 defineProperty 的优势 
- 10、watch computed区别
- 11、virtual dom 原理实现
- 12、vue-router(hash， HTML5 新增的 pushState
  - 单页应用，如何实现其路由功能---路由原理
  - vue-router如何做用户登录权限等
  - 你在项目中怎么实现路由的嵌套
- 13、vuex的理解 

### 前端性能优化
- 页面DOM节点太多，会出现什么问题？如何优化？
- 如何做性能监测

### 微信小程序
微信小程序和h5差异，如果有开发weex的经验，可能会加上weex

### git

一些基本命令
打包工具webpack
- 1、打包原理
- 2、打包插件
- 3、webpack热更新原理
- 4、优化构建速度

### 其它
- 移动端适配
- pc端浏览兼容 电脑分辨率兼容


    

