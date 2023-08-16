# 大厂真题

## 极兔

### 1、avue封装？

### 2、国际化？
- 1.使用vue-i18n
```js
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: lang || process.env.VUE_APP_I18N_LOCALE || 'zh-cn', // 初始未选择默认 en 英文
  messages: { ...langs }
})
export default i18n
```
- 2.引入element语言包
```js
//cn.js
import lang from 'element-ui/lib/locale/lang/zh-CN' // 引入element语言包
const messages = {
  message: {
    'text': '好好学习，天天向上'
  },
  ...lang
}
export default messages
```
- 3.设置全局$lang
```js
// 1.将$lang挂载在vue.prototype上
// 2.定义全局全局$lang函数
// 国际化过滤器
export function lang(str) {
  // 区分自定义el组件的国际化
  if (str && str.indexOf('el.') > -1) {
    const messages = i18n.messages[LANG_ELEMENT_MAP[store.state.base.lang]]
    return filterLangValue(str, messages)
  }
  const value = store.state.base.lang || 'CN'
  if (value !== window.langOld || !window.langJsonOld) {
    window.langJsonOld = {}
    window.langOld = value
    //  保存多语言字典 langJsonAll数据量太大， //langJsonAll登陆时接口返回
    // langJsonAll：{ 0-5分钟: {CN: "0-5分钟", EN: "0-5 minutes"}} 
    Object.entries(store.state.base.langJsonAll).forEach(([key, val]) => (window.langJsonOld[key] = val[value]))
    //langJsonOld ={0-5分钟:0-5 minutes}
  }
  return window.langJsonOld[str] || str || ''
}

```
- 4.使用
```js
:title="$lang('下载中心')" 
```

### 3、主题切换？
- 1.window.document.body.setAttribute('data-theme', value + '-theme')
在根元素设置属性**data-theme=‘green-theme’** green就是主题，主题切换时改变这个值

- 2.定义映射集合
```js
$component-themes: (
  default-theme: $default-theme,    // 白色
  green-theme: $green-theme,        // 红色
  black-theme: $black-theme         // 暗色
);
```

- 3.定义mixins.scss
```js
//举例 text-color

 /* 文字颜色宏  $type， 默认常规颜色 routine */
// brand      品牌色文字
// main       主标题文字
// subtitle   次标题文字
// routine    常规文字
// secondary  次要文字
// occupy     提示文字
// disabled   禁用状态文字
@mixin text-color($type:'routine'){
  // default-theme: $default-theme,    // 白色
  // green-theme: $green-theme,        // 红色
  // black-theme: $black-theme         // 暗色
  @each $themename , $theme in $component-themes {
    [data-theme = '#{$themename}'] & {
      color: map-get($map: $theme, $key: 'text-color-#{$type}');
      // $map：定义好的 map。
      // $key：需要遍历的 key。
      // color：$default-theme对象里取text-color-routine
    }
  }
}

```
- 4.定义不同主题样式
```js
$default-theme: (
   // 次标题文字
  text-color-subtitle: $-color-text-shalow-subtitle,
  // 常规文字
  text-color-routine: $-color-text-shalow-routine,
)

// 红色模式
$green-theme:(
  // 次标题文字
  text-color-subtitle: $-color-text-shalow-subtitle,
  // 常规文字
  text-color-routine: $-color-text-shalow-routine,
)
```
- 5.使用
```js
.hwh-number {
    @include text-color('brand'); 
}
```



## 科脉

### 1、vite + vue3项目遇到了什么问题？
- 使用vite搭建整体架构，vue3+Typescipt进行项目开发；
- 引入vue-router4进行路由配置；
- 接入vite-plugin-compression、rollup-plugin-external-globals等插件进行项目优化；


### 2、小程序性能优化？
 问题：业务赋值、代码耦合、逻辑混乱
#### 已落实：
- 1.静态图片全部替换
- 2.无用文件、函数、代码样式剔除
- 3.首页接口调整(无用接口删除、重复调用删除、接口后置) 非关键渲染数据延迟请求
- 4.没必要的逻辑后移 精简首页加载业务逻辑
- 5.图片加oss裁剪优化
- 6.新增分包（调整分包命名规则package-sub）、分包预下载
#### 未添加（京喜）：
 - 1.主体模块（导航、商品轮播、商品豆腐块等）和 非主体模块（幕帘弹窗、右侧挂件等）
在初始化首页时，小程序会发起一个聚合接口请求来获取主体模块的数据，而非主体模块的数据
则从另一个接口获取，通过拆分的手段来降低主接口的调用时延，同时减少响应体的数据量，
缩减网络传输时间
 - 2.分屏渲染
这也是关键渲染路径优化思路之一，通过延迟非关键元素的渲染时机，为关键渲染路径腾出资源。

类似上一条措施，继续以京喜小程序首页为例，我们在 主体模块 的基础上再度划分出 首屏模块
（商品豆腐块以上部分） 和 非首屏模块（商品豆腐块及以下部分）。当小程序获取到主体模块的
数据后，会优先渲染首屏模块，在所有首屏模块都渲染完成后才会渲染非首屏模块和非主体模块，
以此确保首屏内容以最快速度呈现。
- 3.接口聚合，请求合并
A.wx.request （HTTP 连接）的最大并发限制是 10 个；
B.wx.connectSocket （WebSocket 连接）的最大并发限制是 5 

超出并发限制数目的 HTTP 请求将会被阻塞，需要在队列中等待前面的请求完成，
从而一定程度上增加了请求时延。因此，对于职责类似的网络请求，最好采用节流的方式，
先在一定时间间隔内收集数据，再合并到一个请求体中发送给服务端
- 4.图片资源优化
使用 WebP 格式、图片裁剪&降质、图片懒加载、
降级加载大图资源（我们可以先呈现高度压缩的模糊图片，同时利用一个隐藏的
节点来加载原图，待原图加载完成后再转移到真实节点上渲染）


## bind有什么用？连续多个bind，最后this指向是什么？
<!-- - bind的作用是改变函数执行的指向，且不会立即执行，而是返回一个新的函数，可以自主调用这个函数的执行,连续多个bind之后this指向始终指向第一个。 -->

<!-- ## DOMContentLoaded和load的区别

- 当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完全加载
- load 仅用于检测一个完全加载的页面，页面的html、css、js、图片等资源都已经加载完之后才会触发 load 事件 -->

