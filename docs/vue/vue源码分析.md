# vue源码分析

::: tip 
  将回答问题的方式、思路和层次提升一个层级
:::

## 1.v-if和v-for哪个优先级更高？同时出现 如何优化？
> 源码 compiler/condegen/index.js

#### 结论
- 1.显然v-for的优先级高于v-if (codegenindex源码中顺序为el.once > el.for < el.if)
- 2.如果同时出现，每次渲染都会先执行循环在判断，循环不可避免，浪费性能
- 3.将v-if提到外面一层，内部进行v-for循环

## 2.Vue组件data为什么必须是个函数而Vue的根实例没有这个限制？
> 源码 src/core/instance/state.js - initData()

#### 结论
- Vue组件可能存在多个实例，如果使用对象形式定义data,他们将会公用一个data对象，状态改变将会
影响多个组件实例;采用函数定义，在initData时会返回一个全新的data对象，避免多实例的状态污染。
Vue跟实例不会出现这个问题，是因为根实例只能有一个。

## 3.Vue中的key的作用和工作原理？
> 源码 src/core/vdom/patch.js - updateChildren()

#### 结论
- 1.key的主要作用是为了更高效的更新虚拟Dom,其原理是vue在patch过程中通过key可以精准的判断两个节点
是否是同一个，避免频繁更新不同的元素，会让整个patch过程更加高效，减少dom操作，提高性能。
- 2.若不设置key还可能在列表更新引发一些隐藏的bug

## 4.怎么理解vue中的diff算法？
> 源码分析1：必要性 lifecycle.js - mountConponent()
组件中可能存在很多个data中的key使用
> 源码分析2：执行方法 patch.js- patchVnode()
patchVnode是diff发生的地方 整体策略:深度优先，同级比较
> 源码分析3：高效性 patch.js -updateChildren()
 
#### 结论
- 1.diff算法是虚拟DOM的必然产物：通过新旧虚拟DOM作对比，将变化的地方更新在真实的DOM上，
另外，也需要diff高效的执行对比过程。
- 2.vue 2.x中为了降低Watcher粒度，每个组件只有一个watcher与之对应，只有引入diff才能精确找到
变化的地方。
- 3.vue中diff执行的时刻是组件实例执行其更新函数时，它会对比上一次渲染结果的oldVnode和新的渲染结果
newVnode,此过程称为patch。

## 5.Vue组件化的理解？
> 组件化定义，优点，使用场景和注意事项。
> 源码分析1：组件定义 src/core/global-api/assets.js
vue-loader会编译template为render函数，最终导出的依然是组件配置对象。
> 源码分析2：组件化优点 lifecycle.js = mountComponent()
组件、watcher、渲染函数和更新函数之间的关系
> 源码分析3：组件化实现 src/code/global-api/extend.js
实例化及挂载，src/core/vdom/patch.js - createElm()
 
#### 结论
- 1.组件化是软件工程中的一种思想，组件是独立和可复用的代码单元。组件是vue核心特性之一。
- 2.组件化开发能大幅度提高效率，测试性，复用性。
- 3.组件按分类有：页面组件，业务组件，通用组件。
- 4.vue的组件是基于配置的，我们通常编写的组件是组件配置而非组件，框架后续会生成其构造函数，
他们是基于vueComponent,拓展于Vue；
- 5.vue中常见的组件化：属性prop,自定义事件，插槽。
- 6.组件应该是高内聚，低耦合的。
- 7.遵循单向数据流的原则。

## 6.谈一谈vue设计原则？
- 1.渐进式js框架
- 2.易用 灵活 高效


## 7.你了解哪些Vue的性能优化方法(代码层面)？
- 1.路由懒加载
```js
component : ()=>import("./xx.vue")

```
- 2.keep-alive 缓存页面
```js
 <keep-alive include="getProcess">
        <router-view></router-view>
</keep-alive>
```
- 3.使用v-show复用dom
- 4.v-for 遍历避免同时使用v-if
- 5.长列表性能优化
  - 如果列表是纯粹的数据展示，Object,freeze()冻结
  - 如果是大数据长列表 可采用虚拟滚动。 vue-virtual-scroller
- 6.图片懒加载
- 7.第三方插件按需引入  
- 8.无状态的组件标记为函数式组件
```js
<template functional>
    <div class="tab">
         <div v-if="props.value"></div>
    </div>
</template>    
<script>
export default {
    props:['value']
}
</script>
```

## 8.对3.0的新特性有没有了解？
- 更快
  - 虚拟DOM重写
  - 优化slots的生成
  - 静态属性提升
  - 基于proxy的响应式系统
- 更小：优化核心库体积
- 更易维护：Ts+模块化
- 更加优化
- 更容易使用

## 9.computed的实现原理
- 1.当组件初始化的时候，computed 和 data 会分别建立各自的响应系统，Observer遍历 data 中每个属性设置 get/set 数据拦截
- 2.初始化 computed 会调用 initComputed 函数
  - 1.注册一个 watcher 实例，并在内实例化一个 Dep 消息订阅器用作后续收集依赖（比如渲染函数的 watcher 或者其他观察该计算属性变化的 watcher 
  - 2.调用计算属性时会触发其Object.defineProperty的get访问器函数
  - 3.调用 watcher.depend() 方法向自身的消息订阅器 dep 的 subs 中添加其他属性的 watcher
  - 4.调用 watcher 的 evaluate 方法（进而调用 watcher 的 get 方法）让自身成为其他 watcher 的消息订阅器的订阅者，首先将 watcher 赋给 Dep.target，然后执行 getter 求值函数，当访问求值函数里面的属性（比如来自 data、props 或其他 computed）时，会同样触发它们的 get 访问器函数从而将该计算属性的 watcher 添加到求值函数中属性的 watcher 的消息订阅器 dep 中，当这些操作完成，最后关闭 Dep.target 赋为 null 并返回求值函数结果
- 3.当某个属性发生变化，触发 set 拦截函数，然后调用自身消息订阅器 dep 的 notify 方法，遍历当前 dep 中保存着所有订阅者 wathcer 的 subs 数组，并逐个调用 watcher 的 update 方法，完成响应更新


## 10.vue对数组做了哪些处理
Object.defineProperty不支持监听数组变化。所以需要重写数组上面的方法
```js
const arrayProto = Array.prototype//原生Array的原型
export const arrayMethods = Object.create(arrayProto);
[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
].forEach(function (method) {
  const original = arrayProto[method]//缓存元素数组原型
  //这里重写了数组的几个原型方法
  def(arrayMethods, method, function mutator () {
    //这里备份一份参数应该是从性能方面的考虑
    let i = arguments.length
    const args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    const result = original.apply(this, args)//原始方法求值
    const ob = this.__ob__//这里this.__ob__指向的是数据的Observer
    let inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})

//定义属性
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
```
- 第一步：先获取原生 Array 的原型方法，因为拦截后还是需要原生的方法帮我们实现数组的变化。
- 第二步：对 Array 的原型方法使用 Object.defineProperty 做一些劫持拦截操作。
- 第三步：把需要被拦截的 Array 类型的数据原型指向改造后原型。
Vue在observer数据阶段会判断如果是数组的话，则修改数组的原型，这样的话，后面对数组的任何操作都可以在劫持的过程中控制。







