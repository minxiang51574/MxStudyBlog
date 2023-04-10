# 二、Vue3
## 1、响应式原理

### Vue3对比Vue2的变化
- 在Vue2的时候使用defineProperty来进行数据的劫持, 需要对属性进行重写添加getter及setter 性能差。
- 当新增属性和删除属性时无法监控变化。需要通过$set、$delete实现
- 数组不采用defineProperty来进行劫持 （浪费性能，对所有索引进行劫持会造成性能浪费）需要对数组单独进行处理
  
> Vue3中使用Proxy来实现响应式数据变化,解决了上述问题

### effect函数
```js
export let activeEffect = undefined;// 当前正在执行的effect

class ReactiveEffect {
    active = true;
    deps = []; // 收集effect中使用到的属性
    parent = undefined;
    constructor(public fn) { }
    run() {
        if (!this.active) { // 不是激活状态
            return this.fn();
        }
        try {
            this.parent = activeEffect; // 当前的effect就是他的父亲
            activeEffect = this; // 设置成正在激活的是当前effect
            return this.fn();
        } finally {
            activeEffect = this.parent; // 执行完毕后还原activeEffect
            this.parent = undefined;
        }

    }
}
export function effect(fn, options?) {
    const _effect = new ReactiveEffect(fn); // 创建响应式effect
    _effect.run(); // 让响应式effect默认执行
}
```

### 依赖收集
> 默认执行 **effect** 时会对属性，进行依赖收集
```js
get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
        return true;
    }
    const res = Reflect.get(target, key, receiver);
    track(target, 'get', key);  // 依赖收集
    return res;
}
```
```js
const targetMap = new WeakMap(); // 记录依赖关系
export function track(target, type, key) {
    if (activeEffect) {
        let depsMap = targetMap.get(target); // {对象：map}
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()))
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = new Set())) // {对象：{ 属性 :[ dep, dep ]}}
        }
        let shouldTrack = !dep.has(activeEffect)
        if (shouldTrack) {
            dep.add(activeEffect);
            activeEffect.deps.push(dep); // 让effect记住dep，这样后续可以用于清理
        }
    }
}
```
> 将属性和对应的effect维护成映射关系，后续属性变化可以触发对应的effect函数重新**run**

### 触发更新
```js
set(target, key, value, receiver) {
    // 等会赋值的时候可以重新触发effect执行
    let oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
        trigger(target, 'set', key, value, oldValue)
    }
    return result;
}
```
```js
export function trigger(target, type, key?, newValue?, oldValue?) {
    const depsMap = targetMap.get(target); // 获取对应的映射表
    if (!depsMap) {
        return
    }
    const effects = depsMap.get(key);
    effects && effects.forEach(effect => {
        if (effect !== activeEffect) effect.run(); // 防止循环
    })
}
```


## 2、计算属性computed

## 3、侦听属性watch


## 4、渲染原理
## 5、Diff算法

## 6、组件异步渲染

## 7、模板编译原理