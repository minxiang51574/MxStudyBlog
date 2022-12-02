# Vue3

## 1、与Vue2区别?
- 1、生命周期的变化

|  Vue2.x   | Vue3  |  
|  ----  | ----  | 
| beforeCreate  | Not needed*  |
| created  | Not needed*  |
| beforeMount  | onBeforeMount  |
| mounted  | onMounted  |
| beforeUpdate  | onBeforeUpdate  |
| updated  | onUpdated  |
| beforeDestroy  | 	onBeforeUnmount  |
| destroyed  | 	onUnmounted  |

	
- 2、多根节点
Vue3 支持了多根节点组件，也就是fragment
- 3、组合式API
- 4、Proxy
  - 对象/数组的新增、删除。
  - 监测.length修改。
  - Map、Set、WeakMap、WeakSet的支持

```js
  //Vue3 的源码 reactive.ts 
  function createReactiveObject(target, isReadOnly, baseHandlers, collectionHandlers, proxyMap) {
  ...
  // collectionHandlers: 处理Map、Set、WeakMap、WeakSet
  // baseHandlers: 处理数组、对象
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}
 ```
使用Reflect.get而不是target[key]的原因是receiver参数可以把this指向getter调用时，而非Proxy构造时的对象

``` js
  //依赖收集
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: Target, key: string | symbol, receiver: object) {
    ...
    // 数组类型
    const targetIsArray = isArray(target)
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    // 非数组类型
    const res = Reflect.get(target, key, receiver);
    
    // 对象递归调用
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
// 派发更新
function createSetter() {
  return function set(target: Target, key: string | symbol, value: unknown, receiver: Object) {
    value = toRaw(value)
    oldValue = target[key]
    // 因 ref 数据在 set value 时就已 trigger 依赖了，所以直接赋值 return 即可
    if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
      oldValue.value = value
      return true
    }

    // 对象是否有 key 有 key set，无 key add
    const hadKey = hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
 ```
 - 5、虚拟DOM
 vue3 相比于 Vue2 虚拟DOM 上增加patchFlag字段
1 代表节点为动态文本节点，那在 diff 过程中，只需比对文本对容，无需关注 class、style等。除此之外，发现所有的静态节点，都保存为一个变量进行静态提升，可在重新渲染时直接引用，无需重新创建。
```js
export const enum PatchFlags { 
  TEXT = 1, // 动态文本内容
  CLASS = 1 << 1, // 动态类名
  STYLE = 1 << 2, // 动态样式
  PROPS = 1 << 3, // 动态属性，不包含类名和样式
  FULL_PROPS = 1 << 4, // 具有动态 key 属性，当 key 改变，需要进行完整的 diff 比较
  HYDRATE_EVENTS = 1 << 5, // 带有监听事件的节点
  STABLE_FRAGMENT = 1 << 6, // 不会改变子节点顺序的 fragment
  KEYED_FRAGMENT = 1 << 7, // 带有 key 属性的 fragment 或部分子节点
  UNKEYED_FRAGMENT = 1 << 8,  // 子节点没有 key 的fragment
  NEED_PATCH = 1 << 9, // 只会进行非 props 的比较
  DYNAMIC_SLOTS = 1 << 10, // 动态的插槽
  HOISTED = -1,  // 静态节点，diff阶段忽略其子节点
  BAIL = -2 // 代表 diff 应该结束
}
```
- 6、Diff 优化
patchFlag帮助 diff 时区分静态节点，以及不同类型的动态节点。一定程度地减少节点本身及其属性的比对

- 7、打包优化
tree-shaking：模块打包webpack、rollup等中的概念。移除 JavaScript 上下文中未引用的代码。主要依赖于import和export语句，用来检测代码模块是否被导出、导入，且被 JavaScript 文件使用。

- 8、TypeScript 支持
	
	
	

#### 他是如何提升的（How）
- 响应式系统提升： 使用Proxy提升了响应式的性能和功能
- 编译优化： 标记和提升所有的静态节点，diff时只需要对比动态节点内容
- 事件缓存： 提供了事件缓存对象cacheHandlers，无需重新创建函数直接调用缓存的事件回调
- 打包和体积优化： 按需引入，Tree shaking支持（ES Module）


