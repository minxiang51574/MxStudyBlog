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
接受一个 getter 函数，并根据 getter 的返回值返回一个不可变的响应式 ref 对象
```js
import { isFunction } from "@vue/shared";
import { activeEffect, ReactiveEffect, trackEffects, triggerEffects } from "./effect";

class ComputedRefImpl {
    public effect;
    public _value;
    public dep;
    public _dirty = true;
    constructor(getter,public setter) {
        this.effect = new ReactiveEffect(getter,()=>{ 
            if(!this._dirty){ // 依赖的值变化更新dirty并触发更新
                this._dirty = true;
                triggerEffects(this.dep)
            }
        });
    }
    get value(){ // 取值的时候进行依赖收集
        if(activeEffect){
            trackEffects(this.dep || (this.dep = new Set));
        }
        if(this._dirty){ // 如果是脏值, 执行函数
            this._dirty = false;
            this._value = this.effect.run(); 
        }
        return this._value; 
    }
    set value(newValue){
        this.setter(newValue)
    }
}
export function computed(getterOrOptions) {
    const onlyGetter = isFunction(getterOrOptions); // 传入的是函数就是getter
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => { }
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    // 创建计算属性
    return new ComputedRefImpl(getter, setter)
}
```
> 创建ReactiveEffect时，传入scheduler函数，稍后依赖的属性变化时调用此方法！

```js
export function triggerEffects(effects) { 
    effects = new Set(effects);
    for (const effect of effects) {
        if (effect !== activeEffect) { // 如果effect不是当前正在运行的effect
            if (effect.scheduler) {
                effect.scheduler()
            } else {
                effect.run(); // 重新执行一遍
            }
        }
    }
}
export function trackEffects(dep) { // 收集dep 对应的effect
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep); 
    }
}
```

## 3、侦听属性watch
watch的核心就是观测一个响应式数据，当数据变化时通知并执行回调 （那也就是说它本身就是一个effect）
```js
watch(state,(oldValue,newValue)=>{ // 监测一个响应式值的变化
    console.log(oldValue,newValue)
})
```
### 监测响应式对象
```js
function traverse(value,seen = new Set()){
    if(!isObject(value)){
        return value
    }
    if(seen.has(value)){
        return value;
    }
    seen.add(value);
    for(const k in value){ // 递归访问属性用于依赖收集
        traverse(value[k],seen)
    }
    return value
}
export function isReactive(value){
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
export function watch(source,cb){
    let getter;
    if(isReactive(source)){ // 如果是响应式对象
        getter = () => traverse(source)// 包装成effect对应的fn, 函数内部进行遍历达到依赖收集的目的
    }
    let oldValue;
    const job = () =>{
        const newValue = effect.run(); // 值变化时再次运行effect函数,获取新值
        cb(newValue,oldValue);
        oldValue = newValue
    }
    const effect = new ReactiveEffect(getter,job) // 创建effect
    oldValue = effect.run(); // 运行保存老值
}
```

### 监测函数
```js
export function watch(source,cb){
    let getter;
    if(isReactive(source)){ // 如果是响应式对象
        getter = () => traverse(source)
    }else if(isFunction(source)){
        getter = source // 如果是函数则让函数作为fn即可
    }
    // ...
}
```
### watch中回调执行时机
```js
export function watch(source,cb,{immediate} = {} as any){
	const effect = new ReactiveEffect(getter,job) // 创建effect
    if(immediate){ // 需要立即执行，则立刻执行任务
        job();
    }
    oldValue = effect.run(); 
}

```
### watch中cleanup实现
> 连续触发watch时需要清理之前的watch操作

```js
const state = reactive({ flag: true, name: 'jw', age: 30 })
let i = 2000;
function getData(timer){
    return new Promise((resolve,reject)=>{
        setTimeout(() => {
            resolve(timer)
        }, timer);
    })
}
watch(()=>state.age,async (newValue,oldValue,onCleanup)=>{
    let clear = false;
    onCleanup(()=>{
        clear = true;
    })
    i-=1000;
    let r =  await getData(i); // 第一次执行1s后渲染1000， 第二次执行0s后渲染0， 最终应该是0
    if(!clear){document.body.innerHTML = r;}
},{flush:'sync'});
state.age = 31;
state.age = 32;
```
```js
let cleanup;
let onCleanup = (fn) =>{
    cleanup = fn;
}
const job = () =>{
    const newValue = effect.run(); 
    if(cleanup) cleanup(); // 下次watch执行前调用上次注册的回调
    cb(newValue,oldValue,onCleanup); // 传入onCleanup函数
    oldValue = newValue
}
```

## 4、Vue3渲染原理

### 实现节点常用操作
> **runtime-dom/src/nodeOps** 这里存放常见DOM操作API，不同运行时提供的具体实现不一样，最终将操作方法传递到**runtime-core**中，所以**runtime-core**不需要关心平台相关代码~
```js
export const nodeOps = {
    insert: (child, parent, anchor) => { // 添加节点
        parent.insertBefore(child, anchor || null);
    },
    remove: child => { // 节点删除
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createElement: (tag) => document.createElement(tag),// 创建节点
    createText: text => document.createTextNode(text),// 创建文本
    setText: (node, text) => node.nodeValue = text, //  设置文本节点内容
    setElementText: (el, text) => el.textContent = text, // 设置文本元素中的内容
    parentNode: node => node.parentNode, // 父亲节点
    nextSibling: node => node.nextSibling, // 下一个节点
    querySelector: selector => document.querySelector(selector) // 搜索元素
}
```
### 比对属性方法
```js
export const patchProp = (el, key, prevValue, nextValue) => {
    if (key === 'class') {
        patchClass(el, nextValue)
    } else if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
        patchEvent(el, key, nextValue)
    } else {
        patchAttr(el, key, nextValue)
    }
}
```
#### 操作类名
```js
function patchClass(el, value) { // 根据最新值设置类名
    if (value == null) {
        el.removeAttribute('class');
    } else {
        el.className = value;
    }
}
```
#### 操作样式
```js
function patchStyle(el, prev, next) { // 更新style
    const style = el.style;
    for (const key in next) { // 用最新的直接覆盖
        style[key] = next[key]
    }
    if (prev) {
        for (const key in prev) {// 老的有新的没有删除
            if (next[key] == null) {
                style[key] = null
            }
        }
    }
}
```
#### 操作事件
```js
function createInvoker(initialValue) {
    const invoker = (e) => invoker.value(e);
    invoker.value = initialValue;
    return invoker;
}
function patchEvent(el, rawName, nextValue) {  // 更新事件
    const invokers = el._vei || (el._vei = {});
    const exisitingInvoker = invokers[rawName]; // 是否缓存过

    if (nextValue && exisitingInvoker) {
        exisitingInvoker.value = nextValue;
    } else {
        const name = rawName.slice(2).toLowerCase(); // 转化事件是小写的
        if (nextValue) {// 缓存函数
            const invoker = (invokers[rawName]) = createInvoker(nextValue);
            el.addEventListener(name, invoker);
        } else if (exisitingInvoker) {
            el.removeEventListener(name, exisitingInvoker);
            invokers[rawName] = undefined
        }
    }
}
```
> 在绑定事件的时候，绑定一个伪造的事件处理函数invoker，把真正的事件处理函数设置为invoker.value属性的值


#### 操作属性
```js
function patchAttr(el, key, value) { // 更新属性
    if (value == null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, value);
    }
}
```
### 创建渲染器
> 最终我们在 index.js中引入写好的方法，渲染选项就准备好了。 稍后将虚拟DOM转化成真实DOM会调用这些方法
```js
import { nodeOps } from "./nodeOps"
import { patchProp } from "./patchProp"

// 准备好所有渲染时所需要的的属性
const renderOptions = Object.assign({patchProp},nodeOps);
createRenderer(renderOptions).render(
    h('h1','jw'),
    document.getElementById('app')
);
```
> createRenderer接受渲染所需的方法，h方法为创建虚拟节点的方法。这两个方法和平台无关，所以我们将这两个方法在runtime-core中实现

### 虚拟节点的实现
#### 形状标识
通过组合可以描述虚拟节点的类型
```js
export const enum ShapeFlags { // vue3提供的形状标识
    ELEMENT = 1,
    FUNCTIONAL_COMPONENT = 1 << 1,
    STATEFUL_COMPONENT = 1 << 2,
    TEXT_CHILDREN = 1 << 3,
    ARRAY_CHILDREN = 1 << 4,
    SLOTS_CHILDREN = 1 << 5,
    TELEPORT = 1 << 6,
    SUSPENSE = 1 << 7,
    COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
    COMPONENT_KEPT_ALIVE = 1 << 9,
    COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
```
#### createVNode实现
```js
export function isVNode(value: any){
    return value ? value.__v_isVNode === true : false
}
export const createVNode = (type,props,children = null)=>{
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT:0;
    const vnode = {
        __v_isVNode: true,
        type,
        props,
        key: props && props['key'],
        el: null,
        children,
        shapeFlag
    }
    if(children){
        let type = 0;
        if(Array.isArray(children)){
            type = ShapeFlags.ARRAY_CHILDREN;
        }else{
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN
        }
        vnode.shapeFlag |= type
        // 如果shapeFlag为9 说明元素中包含一个文本
        // 如果shapeFlag为17 说明元素中有多个子节点
    }
    return vnode;
}
```
> createVNode的写法比较死板，我们让他变的更灵活些

#### h实现
```js
export function h(type, propsOrChildren?, children?) {
    const l = arguments.length;
    if (l === 2) { // 只有属性，或者一个元素儿子的时候
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
            if (isVNode(propsOrChildren)) { // h('div',h('span'))
                return createVNode(type, null, [propsOrChildren])
            }
            return createVNode(type, propsOrChildren);  // h('div',{style:{color:'red'}});
        } else { // 传递儿子列表的情况
            return createVNode(type, null, propsOrChildren); // h('div',null,[h('span'),h('span')])
        }
    }else{
        if(l > 3){ // 超过3个除了前两个都是儿子
            children = Array.prototype.slice.call(arguments,2);
        } else if( l === 3 && isVNode(children)){
            children = [children]; // 儿子是元素将其包装成 h('div',null,[h('span')])
        }
        return createVNode(type,propsOrChildren,children) // h('div',null,'jw')
    }
}
// 注意子节点是：数组、文本、null
```
### createRenderer实现
> render方法就是采用runtime-dom中提供的方法将虚拟节点转化成对应平台的真实节点渲染到指定容器中。
```js
export function createRenderer(options){
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
      } = options
    const patch = (n1,n2,container) => {
        // 初始化和diff算法都在这里喲
    }
    const render = (vnode,container) =>{
        if(vnode == null){
            if(container._vnode){ } // 卸载
        }else{
            patch(container._vnode || null,vnode,container); // 初始化和更新
        }
        container._vnode = vnode;
    }
    return {
        render
    }
}
```
### 创建真实DOM
```js
const mountChildren = (children,container) =>{
    for(let i = 0; i < children.length;i++){
        patch(null,children[i],container);
    }
}
const mountElement = (vnode,container) =>{
    const {type,props,shapeFlag} = vnode
    let el = vnode.el = hostCreateElement(type); // 创建真实元素，挂载到虚拟节点上
    if(props){ // 处理属性
        for(const key in props){ // 更新元素属性
            hostPatchProp(el,key,null,props[key]); 
        }
    }
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){ // 文本
        hostSetElementText(el, vnode.children);
    }else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){ // 多个儿子
        mountChildren(vnode.children,el);
    }
    hostInsert(el,container); // 插入到容器中
}
const patch = (n1,n2,container) => {
    // 初始化和diff算法都在这里喲
    if(n1 == n2){
        return 
    }
    if(n1 == null){ // 初始化的情况
        mountElement(n2,container); 
    }else{
        // diff算法
    }
}
```

### 卸载DOM
```js
createRenderer(renderOptions).render(null,document.getElementById('app'));

const unmount = (vnode) =>{hostRemove(vnode.el)}
const render = (vnode,container) =>{
    if(vnode == null){
        if(container._vnode){// 卸载
            unmount(container._vnode); // 找到对应的真实节点将其卸载
        }
    }else{
        patch(container._vnode || null,vnode,container); // 初始化和更新
    }
    container._vnode = vnode;
}
```

## 5、Diff算法

## 6、组件渲染


## 7、模板编译原理