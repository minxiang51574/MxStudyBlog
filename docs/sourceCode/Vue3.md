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

### 前后元素不一致
> 两个不同虚拟节点不需要进行比较，直接移除老节点，将新的虚拟节点渲染成真实DOM进行挂载即可
```js
export const isSameVNodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
}
const patch = (n1,n2,container) => {
    // 初始化和diff算法都在这里喲
    if(n1 == n2){return }
    if(n1 && !isSameVNodeType(n1,n2)){ // 有n1 是n1和n2不是同一个节点
        unmount(n1)
        n1 = null
    }
    if(n1 == null){ // 初始化的情况
        mountElement(n2,container); 
    }else{
        // diff算法
    }
}
```

### 前后元素一致
> 前后元素一致则比较两个元素的属性和孩子节点
```js
const patchElement = (n1, n2) => {
    let el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el); // 比对新老属性
    patchChildren(n1, n2, el); // 比较元素的孩子节点
}
const processElement = (n1, n2, container) => {
    if (n1 == null) {
        mountElement(n2, container)
    } else {
        patchElement(n1, n2); // 比较两个元素
    }
}
```

### 子元素比较情况
| 新儿子  | 旧儿子   | 操作方式   | 
| ------------------------- | ----------------------------------------------------------------------- | --------------- | 
| 文本 | 数组 |  删除老儿子，设置文本内容 |  
| 文本 | 文本 | （更新文本即可） |  
| 文本 | 空 |  更新文本即可) 与上面的类似 | 
| 数组  | 数组 |  （diff算法） | 
| 数组  | 文本 |  （清空文本，进行挂载） |  
| 数组  | 空 |  （进行挂载） 与上面的类似 |  
| 空  | 数组 |  （删除所有儿子） |  
| 空  | 文本 |  （清空文本） |  
| 空  | 空 |  （无需处理）|  

```js
const unmountChildren = (children) =>{
    for(let i = 0 ; i < children.length; i++){
        unmount(children[i]);
    }
}
const patchChildren = (n1,n2,el) => {
    const c1 = n1 && n1.children
    const c2 = n2.children
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
        if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            unmountChildren(c1);
        }
        if(c1 !== c2){
            hostSetElementText(el,c2);
        }
    }else {
        if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
            if(shapeFlag & ShapeFlags.ARRAY_CHILDREN){

            }else{
                unmountChildren(c1);
            }
        }else{
            if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
                hostSetElementText(el,'');
            }
            if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                mountChildren(c2, el);
            }
        }
    }
}
```

### 核心Diff算法
#### sync from start
![image](../images/syncfromstart.png)
```js
 h('div',[
     h('li', { key: 'a' }, 'a'),
     h('li', { key: 'b' }, 'b'),
     h('li', { key: 'c' }, 'c')
 ]) : 
 h('div',[
     h('li', { key: 'a' }, 'a'),
     h('li', { key: 'b' }, 'b'),
     h('li', { key: 'd' }, 'd'),
     h('li', { key: 'e' }, 'e')
 ])
```
```js
const patchKeydChildren = (c1, c2, container) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    // 1. sync from start
    // (a b) c
    // (a b) d e
    while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        if (isSameVNodeType(n1, n2)) {
            patch(n1, n2, container)
        } else {
            break;
        }
        i++;
    }
}
```
#### sync from end
![image](../images/syncfromend.png)
```js
// 2. sync from end
// a (b c)
// d e (b c)
while (i <= e1 && i <= e2) {
    const n1 = c1[e1];
    const n2 = c2[e2];
    if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container);
    } else {
        break;
    }
    e1--;
    e2--;
}
```
### 最长递增子序列
#### 最优情况
> Vue3 采用最长递增子序列，求解不需要移动的元素有哪些
```js
function getSequence(arr) {
    const len = arr.length;
    const result = [0]; // 保存最长递增子序列的索引
    let resultLastIndex;

    for (let i = 0; i < len; i++) {
        const arrI = arr[i]; // 获取数组中的每一项，但是0 没有意义我们需要忽略掉
        if (arrI !== 0) {
            resultLastIndex = result[result.length - 1];
            if (arr[resultLastIndex] < arrI) {
                result.push(i); // 记录索引
                continue
            }
        }
    }
    return result
}
// 针对默认递增的序列进行优化
console.log(getSequence([2, 6, 7, 8, 9, 11]))
```

#### 二分查找查找最长递增个数
```js
function getSequence1(arr) {
    const len = arr.length;
    const result = [0]; // 保存最长递增子序列的索引
    let resultLastIndex;
    let start;
    let end;
    let middle = 0;
    for (let i = 0; i < len; i++) {
        const arrI = arr[i]; // 获取数组中的每一项，但是0 没有意义我们需要忽略掉
        if (arrI !== 0) {
            resultLastIndex = result[result.length - 1];
            if (arr[resultLastIndex] < arrI) {
                result.push(i); // 记录索引
                continue
            }
            start = 0;
            end = result.length - 1; // 二分查找 前后索引
            while (start < end) { // 最终start = end 
                middle = ((start + end) / 2) | 0; // 向下取整
                // 拿result中间值和最后一项比较
                if (arr[result[middle]] < arrI) { // 找比arrI大的值 或者等于arrI
                    start = middle + 1;
                } else {
                    end = middle;  
                }
            }
            if (arrI < arr[result[start]]) { // 当前这个小就替换掉
                result[start] = i; 
            }
        }
    }
    return result
}
```
#### 前驱节点追溯
假设有：[2,3,1,5,6,8,7,9,4] 为最新序列 -> 按照上述结果得出的结论为：[ 2, 1, 8, 4, 6, 7 ]
```js
function getSequence(arr) { // 最终的结果是索引 
    const len = arr.length;
    const result = [0]; // 索引  递增的序列 用二分查找性能高
    const p = arr.slice(0); // 里面内容无所谓 和 原本的数组相同 用来存放索引
    let start;
    let end;
    let middle;
    for (let i = 0; i < len; i++) { // O(n)
        const arrI = arr[i];
        if (arrI !== 0) {
            let resultLastIndex = result[result.length - 1];
            // 取到索引对应的值
            if (arr[resultLastIndex] < arrI) {
                p[i] = resultLastIndex; // 标记当前前一个对应的索引
                result.push(i);
                // 当前的值 比上一个人大 ，直接push ，并且让这个人得记录他的前一个
                continue
            }
            // 二分查找 找到比当前值大的那一个
            start = 0;
            end = result.length - 1;
            while (start < end) { // 重合就说明找到了 对应的值  // O(logn)
                middle = ((start + end) / 2) | 0; // 找到中间位置的前一个
                if (arr[result[middle]] < arrI) {
                    start = middle + 1
                } else {
                    end = middle
                } // 找到结果集中，比当前这一项大的数
            }
            // start / end 就是找到的位置
            if (arrI < arr[result[start]]) { // 如果相同 或者 比当前的还大就不换了
                if (start > 0) { // 才需要替换
                    p[i] = result[start - 1]; // 要将他替换的前一个记住
                }
                result[start] = i;
            }
        }
    }
    let i = result.length // 总长度
    let last = result[i - 1] // 找到了最后一项
    while (i-- > 0) { // 根据前驱节点一个个向前查找
        result[i] = last // 最后一项肯定是正确的
        last = p[last]
    }
    return result;
}
console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]))
```

#### 优化Diff算法
利用最长递增子序列，优化**Diff**算法
```js
// [5,3,4,0] => [1,2]
let increasingNewIndexSequence = getSequence(newIndexToOldMapIndex);
let j = increasingNewIndexSequence.length - 1; // 取出最后一个人的索引
for (let i = toBePatched - 1; i >= 0; i--) {
    let currentIndex = i + s2; // 找到h的索引
    let child = c2[currentIndex]; // 找到h对应的节点
    let anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null; // 第一次插入h 后 h是一个虚拟节点，同时插入后 虚拟节点会
    if (newIndexToOldMapIndex[i] == 0) { // 如果自己是0说明没有被patch过
        patch(null, child, container, anchor)
    } else {
        if (i != increasingNewIndexSequence[j]) {
            hostInsert(child.el, container, anchor); // 操作当前的d 以d下一个作为参照物插入
        } else {
            j--; // 跳过不需要移动的元素， 为了减少移动操作 需要这个最长递增子序列算法  
        }
    }
}
```
## 6、组件渲染
### title、Fragment渲染
> 除了元素虚拟节点之外，Vue3中还有很多其他类型的虚拟节点，这里我们先来说下Text和Fragment的实现
```js
export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')
```
#### 文本类型
```js
renderer.render(h(Text,'jw handsome'),document.getElementById('app'))
```
```js
const patch = (n1,n2,container,anchor?) => {
    // 初始化和diff算法都在这里喲
    if(n1 == n2){return }
    if(n1 && !isSameVNodeType(n1,n2)){ // 有n1 是n1和n2不是同一个节点
        unmount(n1)
        n1 = null
    }
    const {type,shapeFlag} = n2;
    switch(type){
        case Text:
            processText(n1,n2,container); // 处理文本
            break;
        case Fragment:
            processFragment(n1,n2,container); // 处理fragment
            break;
        default:
            if(shapeFlag & ShapeFlags.ELEMENT){ 
                processElement(n1,n2,container,anchor); // 之前处理元素的逻辑
            }
    }
}
```
```js
const processText = (n1,n2,container)=>{
    if(n1 == null){
        hostInsert((n2.el = hostCreateText(n2.children)),container)
    }else{
        const el = n2.el = n1.el;
        if(n2.children !== n1.children){
            hostSetText(el,n2.children)
        }
    }
}
```
#### Fragment类型
```js
renderer.render(h(Fragment,[h(Text,'hello'),h(Text,'jw')]),document.getElementById('app'))
```
```js
const processFragment = (n1,n2,container)=>{
    if(n1 == null){ 
        mountChildren(n2.children,container);
    }else{
        patchChildren(n1,n2,container);
    }
}
```
> 为了让Vue3支持多根节点模板，Vue.js 提供Fragment来实现，核心就是一个无意义的标签包裹多个节点
同时这里要处理下卸载的逻辑，如果是fragment则删除子元素
```js
const unmount = (vnode) =>{
    if(vnode.type === Fragment){
        return unmountChildren(vnode.children)
    }
    hostRemove(vnode.el)
}
```
### 组件渲染
#### 组件的挂载流程
> 组件需要提供一个render函数，渲染函数需要返回虚拟DOM
```js
const VueComponent = {
    data(){
        return {age:13} 
    },
    render(){
        return h('p',[h(Text,"I'm Jiang sir"),h('span',this.age+'')])
    }
}
createRenderer(renderOptions).render(h(VueComponent),document.getElementById('app'))
```
##### 添加组件类型
h方法中传入一个对象说明要渲染的是一个组件。（后续还有其他可能）
```js
export const createVNode = (type,props,children = null)=>{
    const shapeFlag = isString(type)  
        ? ShapeFlags.ELEMENT: isObject(type)
        ? ShapeFlags.STATEFUL_COMPONENT:0;
    // ... 稍后可以根据类型来进行组件的挂载
}
```
##### 组件的渲染
```js
const patch = (n1,n2,container,anchor?) => {
    // 初始化和diff算法都在这里喲
    if(n1 == n2){return }
    if(n1 && !isSameVNodeType(n1,n2)){ // 有n1 是n1和n2不是同一个节点
        unmount(n1)
        n1 = null
    }
    const {type,shapeFlag} = n2;
    switch(type){
        // ...
        default:
            if(shapeFlag & ShapeFlags.ELEMENT){
                processElement(n1,n2,container,anchor)
            }else if(shapeFlag & ShapeFlags.COMPONENT){
                processComponent(n1,n2,container,anchor)
            }
    }
}
```
```js
const mountComponent = (n2,container,anchor)=>{
    const {render,data=()=>({})} = n2.type;
    const state = reactive(data())
    const instance = {
        state, // 组件的状态
        isMounted:false, // 组件是否挂载
        subTree:null, // 子树
        update:null,
        vnode:n2
    }
    const componentUpdateFn = ()=>{
        if(!instance.isMounted){
            const subTree = render.call(state,state);
            patch(null,subTree,container,anchor);
            instance.subTree = subTree
            instance.isMounted = true;
        }else{
            const subTree = render.call(state,state);
            patch(instance.subTree,subTree,container,anchor)
            instance.subTree = subTree
        }
    }
    const effect = new ReactiveEffect(componentUpdateFn)
    const update = instance.update = effect.run.bind(effect);
    update();
}
const processComponent = (n1,n2,container,anchor)=>{
    if(n1 == null){
        mountComponent(n2,container,anchor);
    }else{
        // 组件更新逻辑
    }
}
```

#### 组件异步渲染
修改调度方法，将更新方法压入到队列中
```js
const effect = new ReactiveEffect(
    componentUpdateFn,
    ()=>queueJob(instance.update) 
);
const update = instance.update = effect.run.bind(effect);
```
批处理操作**scheduler.js**
```js
const queue = [];
let isFlushing = false;
const resolvedPromise = Promise.resolve()
export function queueJob(job){
    if(!queue.includes(job)){
        queue.push(job);
    }
    if(!isFlushing){
        isFlushing = true;
        resolvedPromise.then(()=>{
            isFlushing = false;
            for(let i = 0; i < queue.length;i++){
                let job = queue[i];
                job();
            }
            queue.length = 0;
        })
    }
}
```

#### 组件Props、Attrs实现
> **Props**和**Attrs**关系是：没有定义在**component.props**中的属性将存储到**attrs**对象中
```js
const VueComponent = {
    data(){
        return {age:13} 
    },
    props:{
        address:String
    },
    render(){
        return h('p',[
            h(Text,"I'm Jiang sir"),
            h('span',this.age),
            h('span',this.address),
            h(Text,this.$attrs.a + this.$attrs.b)
        ])
    }
}
createRenderer(renderOptions).render(h(VueComponent,{address:'天龙苑',a:1,b:2}),document.getElementById('app'))
```
##### initProps
```js
function initProps(instance,propsOptions,propsData){
    const props = {};
    const attrs = {};
    for(const key in propsData){
        if(key in propsOptions){ // 如果组件中声明了
            props[key] = propsData[key];
        }else{
            attrs[key] = propsData[key];
        }
    }
    instance.props = reactive(props);
    instance.attrs = attrs
}
const mountComponent = (n2,container,anchor)=>{
    const {render,data=()=>({}),props:propsOptions={}} = n2.type;
    const state = reactive(data())
    const instance = {
        state, // 组件的状态
        isMounted:false, // 组件是否挂载
        subTree:null, // 子树
        update:null,
        vnode:n2,
        attrs:{},
        props:{},
    }
    n2.component = instance; // 用于更新
    //               用户写的props 及 传入的props
    initProps(instance,propsOptions,n2.props); // 初始化属性
}
```
##### 属性代理
```js
const publicPropertiesMap = {
    $attrs:i=> i.attrs
}
const renderContext = new Proxy(instance,{
    get(target,key){
        const {state,props} = target;
        if(state && hasOwn(state,key)){
            return state[key];
        }else if(hasOwn(props,key)){
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if(publicGetter){
            return publicGetter(instance)
        }
    },
    set(target,key,value){
        const {state,props} = target;
        if(state && hasOwn(state,key)){
            state[key] = value;
            return true;
        }else if(hasOwn(props,key)){
            console.warn(`Attempting to mutate prop "${key}". Props are readonly.`)
            return false;
        } 
        return true;
    }
});
```
##### 属性更新
```js
const My = {
    props:{address:String},
    render(){return h('div',this.address)}
}
const VueComponent = {
    data(){return {flag:true}},
    props:{address:String},
    render(){
        setTimeout(()=>{
            this.flag = false;
        },1000)
        return h(My,{address:this.flag ? '天龙苑' : '回龙观'})
    }
}
createRenderer(renderOptions).render(h(VueComponent),document.getElementById('app'))
```
```js
const updateComponent = (n1,n2)=>{
    const instance = (n2.component = n1.component);
    const {props:prevProps} = n1;
    const {props:nextProps} = n2;
    if(hasPropsChanged(prevProps,nextProps)){ // 比较前后属性是否一致
        for(const key in nextProps){ // 循环props
            instance.props[key] = nextProps[key]; // 响应式属性更新后会重新渲染
        }
        for(const key in instance.props){ // 循环props
            if(!(key in nextProps)){
                delete instance.props[key]
            }
        }
    }
}
const processComponent = (n1,n2,container,anchor)=>{
    if(n1 == null){
        mountComponent(n2,container,anchor);
    }else{
        // 组件更新逻辑
        updateComponent(n1,n2)
    }
}
```
> 这里我们将更新逻辑放到componentFn中
```js
const updateComponent = (n1,n2)=>{
    const instance = (n2.component = n1.component);
    const {props:prevProps} = n1;
    const {props:nextProps} = n2;
    if(hasPropsChanged(prevProps,nextProps)){
        instance.next = n2 // 将新的虚拟节点放到next属性上
        instance.update(); // 属性变化手动调用更新方法
    }
}
```

```js
const updateComponentPreRender = (instance,next) =>{
    instance.next = null;
    instance.vnode = next;
    for(const key in next.props){ // 循环props
        instance.props[key] = next.props[key];
    }
    for(const key in instance.props){ // 循环props
        if(!(key in next.props)){
            delete instance.props[key]
        }
    }
} 
const componentUpdateFn = ()=>{
    if(!instance.isMounted){
        // ...
    }else{
        let {next} = instance;
        if(next){ // 更新组件在渲染前更新
            updateComponentPreRender(instance,next)
        }
        const subTree = render.call(renderContext,renderContext);
        patch(instance.subTree,subTree,container,anchor)
        instance.subTree = subTree
    }
}
```

### setup函数
#### setup函数作用
组件的render函数每次更新时都会重新执行,但是setup函数只会在组件挂载时执行一次。
- setup函数是compositionAPI的入口
- 可以在函数内部编写逻辑，解决vue2中反复横跳问题
- setup返回函数时为组件的render函数,返回对象时对象中的数据将暴露给模板使用
- setup中函数的参数为props、context({slots,emit,attrs,expose})
  
```js
  const mountComponent = (n2,container,anchor)=>{
    let {render,data=()=>({}),props:propsOptions={},setup} = n2.type;
    const state = reactive(data())
    const instance = {
        state, // 组件的状态
        isMounted:false, // 组件是否挂载
        subTree:null, // 子树
        update:null,
        attrs:{},
        props:{},
        next:null,
        setupState:null,
        vnode:n2
    }
    n2.component = instance;
    // 用户写的props 及 传入的props
    initProps(instance,propsOptions,n2.props); // 初始化属性
    
    if(setup){ // 对setup做相应处理
        const setupContext = {};
        const setupResult = setup(instance.props,setupContext);
        if(isFunction(setupResult)){
            render = setupResult;
        }else if(isObject(setupResult)){
            instance.setupState = proxyRefs(setupResult)
        }
    }
    const renderContext = new Proxy(instance,{
        get(target,key){
            const {state,props,setupState} = target;
            if(state && hasOwn(state,key)){
                return state[key];
            }else if(hasOwn(props,key)){
                return props[key];
            }else if(setupState && hasOwn(setupState,key)){ // setup返回值做代理
                return setupState[key];
            }
            const publicGetter = publicPropertiesMap[key];
            if(publicGetter){
                return publicGetter(instance)
            }
        },
        set(target,key,value){
            const {state,props} = target;
            if(state && hasOwn(state,key)){
                state[key] = value;
                return true;
            }else if(hasOwn(props,key)){
                console.warn(`Attempting to mutate prop "${key}". Props are readonly.`)
                return false;
            } 
            return true;
        }
    });
}
```
#### 实现emit方法
```js
const VueComponent = {
    setup(props,ctx){
        const handleClick = ()=>{
            ctx.emit('myEvent');
        }
        return ()=>h('button',{onClick:handleClick},'点我啊')
    }
}
const app = createApp(h(VueComponent,{onMyEvent:()=>{alert(1000)}}))
app.mount(document.getElementById('app'))
```
```js
const setupContext = {
    attrs:instance.attrs,
    emit:(event,...args)=>{
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
        const handler = instance.vnode.props[eventName]; // 找到绑定的方法
        // 触发方法执行
        handler && handler(...args);
    }
};
```
#### slot实现
```js
const MyComponent = {
    render(){
        return h(Fragment,[
            h('div',[this.$slots.header()]), // 获取插槽渲染
            h('div',[this.$slots.body()]),
            h('div',[this.$slots.footer()]),
        ])
    }
}
const VueComponent = {
    setup(){
        return ()=>h(MyComponent,{ // 渲染组件时传递对应的插槽属性
            header:() => h('p','头'),
            body:() => h('p','体'),
            footer:() => h('p','尾')
        })
    }
}
```
```js
export const createVNode = (type,props,children = null)=>{
    // ....
    if(children){
        let type = 0;
        if(Array.isArray(children)){
            type = ShapeFlags.ARRAY_CHILDREN;
        }else if(isObject(children)){ // 类型是插槽
            type = ShapeFlags.SLOTS_CHILDREN
        }else{
            children = String(children);
            type = ShapeFlags.TEXT_CHILDREN
        }
        vnode.shapeFlag |= type
    }
    return vnode;
}
```
```js
const publicPropertiesMap = {
    $attrs:i=> i.attrs,
    $slots:i=>i.slots
}
function initSlots(instance,children){
    if(instance.vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN){
        instance.slots = children;
    }else{
        instance.slots = {};
    }
}
const mountComponent = (n2,container,anchor)=>{
    const instance = {
        // ...
        slots:null
    }
    // ...
    initProps(instance,propsOptions,n2.props); 
    initSlots(instance,n2.children) // 初始化插槽

    if(setup){ // 对setup做相应处理
        const setupContext = {
            // ...
            slots: instance.slots // 挂载插槽
        };
    }
}
```
#### 生命周期实现原理
```js
export let currentInstance = null
export function setCurrentInstance(instance){
    currentInstance = instance // 用于记住当前实例
} 
```
```js
setCurrentInstance(instance); // 在调用setup的时候保存当前实例
const setupResult = setup(instance.props,setupContext);
setCurrentInstance(null);
```
##### 创建生命周期钩子
```js
export const enum LifecycleHooks {
    BEFORE_MOUNT = 'bm',
    MOUNTED = 'm',
    BEFORE_UPDATE = 'bu',
    UPDATED = 'u'
}
function createHook(type){
    return (hook,target = currentInstance) =>{ // 调用的时候保存当前实例
        if(target){
            const hooks = target[type] || (target[type] = []);
            const wrappedHook = () =>{
                setCurrentInstance(target); // 当生命周期调用时 保证currentInstance是正确的
                hook.call(target); 
                setCurrentInstance(null);
            }
            hooks.push(wrappedHook);
        }
    }
}
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHooks.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHooks.UPDATED);
```
##### 钩子调用
```js
const componentUpdateFn = ()=>{
    if(!instance.isMounted){
        const {bm,m} = instance
        if(bm){ // beforeMount
            invokeArrayFns(bm)
        }
        const subTree = render.call(renderContext,renderContext);
        patch(null,subTree,container,anchor);
        if(m){ // mounted
            invokeArrayFns(m)
        }
        instance.subTree = subTree
        instance.isMounted = true;
    }else{
        let {next,bu,u} = instance;
        if(next){
            updateComponentPreRender(instance,next)
        }
        if(bu){ // beforeUpdate
            invokeArrayFns(bu)
        }
        const subTree = render.call(renderContext,renderContext);
        patch(instance.subTree,subTree,container,anchor)
        if(u){ // updated
            invokeArrayFns(u)
        }
        instance.subTree = subTree
    }
}
```
```js
export const invokeArrayFns = (fns) => {
    for (let i = 0; i < fns.length; i++) {
        fns[i](); // 调用钩子方法
    }
}
```
## 7、模板编译原理