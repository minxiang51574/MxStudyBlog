# Vuex
## 1、手写简易版Vuex
> 实现入口文件，默认导出Store类和install方法

```js
import { Store, install } from './store';
export default {
    Store,
    install
}
export {
    Store,
    install
}
```

### 1.install方法
```js
//当我们使用插件时默认会执行install方法并传入Vue的构造函数
import applyMixin from './mixin'
let Vue;
export class Store {
    constructor(options){}
}
export const install = (_Vue) =>{
    Vue = _Vue;
    applyMixin(Vue);
}
```

### 2.mixin方法
```js
// 将store实例定义在所有的组件实例上
const applyMixin = (Vue) => {
    //在vue生命周期beforeCreate钩子函数前混入vuexInit方法
    Vue.mixin({
        beforeCreate: vuexInit
    })
}

function vuexInit() {
    const options = this.$options;
    if (options.store) { 
        // 给根实例增加$store属性 Vue初始化后，store实例将可以通过this.$store访问
        this.$store = options.store;
    } else if (options.parent && options.parent.$store) {
        // 给组件增加$store属性
        this.$store = options.parent.$store;
    }
}
export default applyMixin
```

### 3.实现state
```js
export class Store {
    constructor(options){
        let state = options.state;
        this._vm = new Vue({
            data:{
                $$state:state,
            }
        });
    }
    get state(){
        return this._vm._data.$$state
    }
}
```
> 将用户传入的数据定义在vue的实例上 （这个就是vuex核心）产生一个单独的vue实例进行通信，这里要注意的是定义$开头的变量不会被代理到实例上

### 4.实现getters
```js
this.getters = {};
const computed = {}
forEachValue(options.getters, (fn, key) => {
    computed[key] = () => {
        return fn(this.state);
    }
    Object.defineProperty(this.getters,key,{
        get:()=> this._vm[key]
    })
});
this._vm = new Vue({
    data: {
        $$state: state,
    },
    computed // 利用计算属性实现缓存
});
```

### 5.实现mutations
```js
export class Store {
    constructor(options) {
        this.mutations = {};
        forEachValue(options.mutations, (fn, key) => {
            this.mutations[key] = (payload) => fn.call(this, this.state, payload)
        });
    }
    commit = (type, payload) => {
        this.mutations[type](payload);
    }
}
```

### 6.实现actions
```js
export class Store {
    constructor(options) {
        this.actions = {};
        forEachValue(options.actions, (fn, key) => {
            this.actions[key] = (payload) => fn.call(this, this,payload);
        });
    }
    dispatch = (type, payload) => {
        this.actions[type](payload);
    }
}
```

## 2、实例挂载到Vue
> 在vuexInit方法，将options参数中的Store实例，挂载到this.$store中；而vuexInit方法时通过Vue.use时，调用插件的install方法，通过Vue.mixin的方式，将改vuexInit挂载到Vue的声明周期中；
```js
// 将store实例定义在所有的组件实例上
const applyMixin = (Vue) => {
    //在vue生命周期beforeCreate钩子函数前混入vuexInit方法
    Vue.mixin({
        beforeCreate: vuexInit
    })
}

function vuexInit() {
    const options = this.$options;
    if (options.store) { 
        // 给根实例增加$store属性 Vue初始化后，store实例将可以通过this.$store访问
        this.$store = options.store;
    } else if (options.parent && options.parent.$store) {
        // 给组件增加$store属性
        this.$store = options.parent.$store;
    }
}
export default applyMixin
```

## 3、state、getters如何响应式
> 内部定义的Vue实例，实现响应式；Vuex的state状态是响应式，是借助vue的data是响应式，将state存入vue实例组件的data中；Vuex的getters则是借助vue的计算属性computed实现数据实时监听
```js
export class Store {
    constructor(options){
        let state = options.state;
        this._vm = new Vue({
            data:{
                $$state:state,
            }
        });
    }
    get state(){
        return this._vm._data.$$state
    }
}
```

## 4、命名空间是怎么实现的？
> Vuex使用命名空间对模块间进行隔离，不同命名空间的state、actions、mutations、getters调用，需要添加模块名，在命名空间内部则不需要声明；
这里需要留意的是，源码中对于actions和mutations的处理，是允许相同命名空间的相同actions和mutations，执行过程时这些actions和mutations都会被处理
```js
function registerMutation (store, type, handler, local) {
  // 此处维护一个数组，相同类型的mutation将会放在同一个数据内
  const entry = store._mutations[type] || (store._mutations[type] = [])
  entry.push(function wrappedMutationHandler (payload) {
    handler.call(store, local.state, payload)
  })
}

function registerAction (store, type, handler, local) {
  // 此处维护一个数组，相同类型的actions将会放在同一个数据内
  const entry = store._actions[type] || (store._actions[type] = [])
  entry.push(function wrappedActionHandler (payload) {
    ...省略代码
  })
}

```
另外，子模块namespace的完整构造，是通过数组的reduce累加器方法构造出来；
```js
getNamespace (path) {
  let module = this.root
  // 从根节点，根据路径path拼接出路径
  return path.reduce((namespace, key) => {
    module = module.getChild(key)
    return namespace + (module.namespaced ? key + '/' : '')
  }, '')
}
//getNamespace(['first', 'second'])，则返回first/second/；
```
> 命名空间是实现是通过namespaced后，使得state、actions、mutations、getters的key值具有命名空间的前缀，从而做到相互独立；访问时，需要通过声明命名空间前缀，才能匹配到对应的key值的实例或方法；关键逻辑在installModule时，构造的namespace前缀，并以此作为最终的key值，注册到Store的私有变量中


## 5、关键函数
### installModule
- 通过Vue.set将子模块的state挂载到父模块的state中，并且使其具有响应式，这就使得state的访问更加方便，不用经过Module对象进行读取了；要知道Vuex中模块是一棵树状结构，并且每个节点是一个Module对象；
- 为新模块构造独立的上下文，这里通过makeLocalContext实现（下文有提到）；
- 以带有模块前缀的key，注册mutation，并且允许声明相同的key名的mutation；
- 以带有模块前缀的key，注册actions，并且允许声明相同的key名的actions；
- 以带有模块前缀的key，注册getter；
- 递归注册其子模块；

### resetStoreVM
```js
function resetStoreVM (store, state, hot) {
  const oldVm = store._vm

  store.getters = {}
  store._makeLocalGettersCache = Object.create(null)
  const wrappedGetters = store._wrappedGetters
  const computed = {}
  forEachValue(wrappedGetters, (fn, key) => {
    // 将getter作为computed的属性，使其具有lazy-caching机制
    computed[key] = partial(fn, store)
    // 这里定义store中的getters，getters对应computed的属性，也即对应wrappedGetters
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
      enumerable: true // for local getters
    })
  })

  const silent = Vue.config.silent
  Vue.config.silent = true
  // 这里实现state的响应式
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
  Vue.config.silent = silent

  if (store.strict) {
    enableStrictMode(store)
  }

  if (oldVm) {
    if (hot) {
      store._withCommit(() => {
        oldVm._data.$$state = null
      })
    }
    Vue.nextTick(() => oldVm.$destroy())
  }
}
```