# Vue2
## 1、vue中几个核心类
- 1.Observe数据监听器：对data里的属性添加getter/setter，进行**依赖收集**以及**派发更新**。
- 2.Dep消息订阅器：用于收集当前响应式对象的依赖关系，每个响应式对象都有一个dep实例。dep.subs=watcher[]，当数据发生变化时，触发dep.notify，该方法会遍历subs数组，调用每一个watcher的update方法。
- 3.Watcher观察者：作为连接 Observer 和 Compile 的桥梁，能够订阅并收到每个属性变动的通知Watcher类有多种，比如computed watcher，user watcher(自己在watch里定义的需要监听数据变化的watcher)。
- 4.Compile指令解析器：它的作用对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数。


## 2、双向数据绑定原理
![dd](../vue-model.jpg)
### 依赖收集
- initstate，对computed属性初始化时，触发computed watcher依赖收集
- initstate，对监听属性初始化时，触发user watcher依赖收集
- render，会触发render依赖收集

### 派发更新 Object.defineProperty
- 1.组件中对相应的数据发生了修改，会触发setter
- 2.dep.notify
- 3.遍历subs数组，调用每一个watcher的update方法

### 过程 
- 初始化阶段，一方面Vue 会遍历 data 选项中的属性，并用 Object.defineProperty 将它们转为 getter/setter，实现数据变化监听功能；另一方面，Vue 的指令编译器Compile 对元素节点的指令进行扫描和解析，初始化视图，并订阅Watcher 来更新视图， 此时Wather 会将自己添加到消息订阅器中(Dep),初始化完毕。
- 当数据发生变化时，Observer 中的 setter 方法被触发，setter 会立即调用Dep.notify()，Dep 开始遍历所有的订阅者，并调用订阅者的 update 方法，订阅者收到通知后对视图进行相应的更新。

### 代码
```js
// src/obserber/index.js
class Observer {
  // 观测值
  constructor(value) {
    this.walk(value);
  }
  walk(data) {
    // 对象上的所有属性依次进行观测
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = data[key];
      defineReactive(data, key, value);
    }
  }
}
// Object.defineProperty数据劫持核心 兼容性在ie9以及以上
function defineReactive(data, key, value) {
  observe(value); // 递归关键
  // --如果value还是一个对象会继续走一遍odefineReactive 层层遍历一直到value不是对象才停止
  //   思考？如果Vue数据嵌套层级过深 >>性能会受影响
  Object.defineProperty(data, key, {
    get() {
      console.log("获取值");
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      console.log("设置值");
      value = newValue;
    },
  });
}
export function observe(value) {
  // 如果传过来的是对象或者数组 进行属性劫持
  if (
    Object.prototype.toString.call(value) === "[object Object]" ||
    Array.isArray(value)
  ) {
    return new Observer(value);
  }
}

```

## 3、Object.defineProperty 缺点？
- 不能监听数组的变化
- 无法检测到对象新增或删除的属性
- 必须遍历对象的每个属性、深层遍历嵌套的对象

## 4、数组的观测

- 1.因为对数组下标的拦截太浪费性能 对 Observer 构造函数传入的数据参数增加了数组的判断
```js
// src/obserber/index.js
import { arrayMethods } from "./array";
class Observer {
  constructor(value) {
    if (Array.isArray(value)) {
      // 这里对数组做了额外判断
      // 通过重写数组原型方法来对数组的七种方法进行拦截
      value.__proto__ = arrayMethods;
      // 如果数组里面还包含数组 需要递归判断
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }
}

```

- 2.每个响应式数据增加了一个不可枚举的__ob__属性 并且指向了 Observer 实例
  - 1.可以根据这个属性来防止已经被响应式观察的数据反复被观测
  - 2.响应式数据可以使用__ob__来获取 Observer 实例的相关方法
```js
// src/obserber/index.js
class Observer {
  // 观测值 给每个value添加__ob__属性
  constructor(value) {
    Object.defineProperty(value, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      //  不可枚举
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
}
```
- 3.对数组原型重写

```js
// src/obserber/array.js
// 先保留数组原型
const arrayProto = Array.prototype;
// 然后将arrayMethods继承自数组原型
// 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能
export const arrayMethods = Object.create(arrayProto);
// 为什么重写七个方法？ 会改变原数组
// 其它方法如何？join concat map filter forEach	reduce every somesome flat slice
// value.__proto__  => arrayMethods => arrayMethods.__proto__ => Array.prototype

let methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
];
methodsToPatch.forEach((method) => {
  arrayMethods[method] = function (...args) {
    //   这里保留原型方法的执行结果
    const result = arrayProto[method].apply(this, args);
    // 这句话是关键
    // this就是被检测的数据，比如数据是{msg:[1,2,3]}，msg.push(4) this就是msg ob就是msg.__ob__ （上段代码增加，该数据已经被响应式观察）所以下面就可以使用ob.observeArray
    const ob = this.__ob__;

    // 这里的标志就是代表数组有新增操作
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }
    // 如果有新增的元素 inserted是一个数组 调用Observer实例的observeArray对数组每一项进行观测
    if (inserted) ob.observeArray(inserted);
    // 之后咱们还可以在这里检测到数组改变了之后从而触发视图更新的操作--后续源码会揭晓
    return result;
  };
});

```

## 5、this访问data和methods

- 通过 this 直接访问到 data 里面的数据的原因是：data里的属性最终会存储到new Vue的实例（vm）上的 _data对象中，访问 this.xxx，是访问Object.defineProperty代理后的 this._data.xxx。
```js
// 初始化data数据
function initData(vm) {
  let data = vm.$options.data;
  //   实例的_data属性就是传入的data
  // vue组件data推荐使用函数 防止数据在组件之间共享
  data = vm._data = typeof data === "function" ? data.call(vm) : data || {};

  // 把data数据代理到vm 也就是Vue实例上面 我们可以使用this.a来访问this._data.a
  for (let key in data) {
    proxy(vm, `_data`, key);
  }
}
// 数据代理
function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get() {
      return object[sourceKey][key];
    },
    set(newValue) {
      object[sourceKey][key] = newValue;
    },
  });
}

```
- 通过this直接访问到methods里面的函数的原因是：因为methods里的方法通过 bind 指定了this为 new Vue的实例(vm)
```js
// initMethods
function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
    }
}


function nativeBind (fn, ctx) {
  return fn.bind(ctx)
}
var bind = Function.prototype.bind
  ? nativeBind
  : polyfillBind

```


## 6、diff算法、虚拟dom
