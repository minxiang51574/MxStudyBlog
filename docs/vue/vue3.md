# vue3

## 1、与Vue2区别?
- 1.Performance：性能更强。
- 2.Tree shaking support：可以将无用模块“剪辑”，仅打包需要的。
- 3.Composition API：组合式API
- 4.Fragment, Teleport, Suspense：“碎片”，Teleport即Protal传送门，“悬念”
- 5.Better TypeScript support：更优秀的Ts支持
- 6.Custom Renderer API：暴露了自定义渲染API

#### 他是如何提升的（How）
- 响应式系统提升： 使用Proxy提升了响应式的性能和功能
- 编译优化： 标记和提升所有的静态节点，diff时只需要对比动态节点内容
- 事件缓存： 提供了事件缓存对象cacheHandlers，无需重新创建函数直接调用缓存的事件回调
- 打包和体积优化： 按需引入，Tree shaking支持（ES Module）

## 2、proxy
