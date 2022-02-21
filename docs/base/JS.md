# JS

[深入理解 javascript 原型和闭包系列](https://dojay.cn/fe/yuanxing.html) 。

## 数据类型及区别

基本类型： number string boolean null undefined symbol bigint

引用数据类型：Object 包含 Object、Function、Array、Date、RegExp、Math

### 请分别介绍它们之间的区别和优劣Object.prototype.toString.call() 、 instanceof 以及 Array.isArray()

> 1.typeof

`typeof` 对于基本类型，除了 `null` 都可以显示正确的类型 可以返回7种数据类型：number、string、boolean、undefined、object、function ，以及 ES6 新增的 symbol
```js
typeof 1; // 'number'
typeof "1"; // 'string'
typeof undefined; // 'undefined'
typeof true; // 'boolean'
typeof Symbol(); // 'symbol'
typeof b; // b 没有声明，但是还会显示 undefined
typeof function b(){} // 'function'
```

`typeof` 对于对象，除了函数都会显示 `object`
```js
typeof []; // 'object'
typeof {}; // 'object'
typeof console.log; // 'function'
```

对于 `null` 来说，虽然它是基本类型，但是会显示 `object`，这是一个存在很久了的 Bug
```js
typeof null; // 'object'
```
> 2.instanceof
- instanceof 判断对象的原型链上是否存在构造函数的原型prototype；
- instanceof 常用来判断 A 是否为 B 的实例
```js
[]  instanceof Array; // true
```
但 instanceof 只能判断引用类型。并且所有对象类型 instanceof Object 都是 true
```js
[]  instanceof Object; // true
```

> 3.Object.prototype.toString.call()
```js
Object.prototype.toString.call("mx"); //[object String]
Object.prototype.toString.call(12); //[object Number]
Object.prototype.toString.call({ name: "jerry" }); //[object Object]
Object.prototype.toString.call([]); //[object Array]
Object.prototype.toString.call(function() {}); //[object Function]
Object.prototype.toString.call(true); //[object Boolean]
Object.prototype.toString.call(undefined); //[object Undefined]
Object.prototype.toString.call(null); //[object Null]
```
Object.prototype.toString.call() 常用于判断浏览器内置对象时。


### 类型转换

- 数字转字符串
  - toString()iba
  - String()
  - +' '
- 字符串转数字
  - parseInt()
  - parseFloat()
  - Number()

## 原型 && 原型链

![原型](../proto.png)
![原型](../proto2.jpg)

#### 原型链：每个对象都有**proto**属性，我们称之为原型，原型也可能是一个对象，如果它是一个对象，也有**proto**属性，这样就形成了一条线型的链，我们称之为原型链。
- 所有对象都有一个属性 __proto__ 指向一个对象，也就是原型
- 每个对象的原型都可以通过 constructor 找到构造函数，构造函数也可以通过 prototype 找到原型
- 所有函数都可以通过 __proto__ 找到 Function 对象
- 所有对象都可以通过 __proto__ 找到 Object 对象
- 对象之间通过 __proto__ 连接起来，这样称之为原型链。当前对象上不存在的属性可以通过原型链一层层往上查找，直到顶层 Object 对象

```js
var Obj = function(){};   //构造函数
var o = new Obj();        //实例
o.__proto__ === Obj.prototype;  //=> true 
o.__proto__.constructor === Obj; //=> true

Obj.__proto__ === Function.prototype; //=> true 
Obj.__proto__.constructor === Function; //=> true

Object.prototype.constructor.__proto__ === Function.prototype // true
Function.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true

```

## this

### JS 中 this 的五种情况
- 1.作为普通函数执行时，this指向window。
- 2.当函数作为对象的方法被调用时，this就会指向该对象。
- 3.构造器调用，this指向返回的这个对象。
- 4.箭头函数 箭头函数的this绑定看的是this所在函数定义在哪个对象下，就绑定哪个对象。如果有嵌套的情况，则this绑定到最近的一层对象上。
- 5.基于Function.prototype上的 apply 、 call 和 bind 调用模式，这三个方法都可以显示的指定调用函数的 this 指向。apply接收参数的是数组，call接受参数列表，`` bind方法通过传入一个对象，返回一个 this 绑定了传入对象的新函数。这个函数的 this指向除了使用new `时会被改变，其他情况下都不会改变。若为空默认是指向全局对象window


#### 1、全局环境

```js
var name = "张三";
function say() {
  console.log(this); //window
  console.log(this.name); //张三
}
say();
```

#### 2、对象环境

```js
var obj = {
  name: "张三",
  say: function() {
    console.log(this.name); //张三
  }
};
obj.say();

//经典面试题1
var name = "张三";
var obj = {
  name: "李四",
  say: function() {
    console.log(this);
    console.log(this.name);
  }
};
var fun = obj.say;
obj.say(); //obj,李四
fun(); //window,张三 -->fun定义在全局环境下，即window.fun()

//经典面试题2

var name = "张三";
var obj = {
  name: "李四",
  say: function() {
    return function() {
      console.log(this.name);
    };
  }
};
var fun = obj.say;
obj.say()(); //张三
fun()(); //张三
```

#### 3、构造函数环境

构造函数中的 this 会指向创建出来的实例对象，使用 new 调用构造函数时，会先创建出一个空对象，然后用 call 函数把构造函数中的 this 指针修改为指向这个空对象。执行完环境后，空对象也就有了相关的属性，然后将对象返回出去，所以说就不用我们自己手动返回

```js
function Person() {
  this.name = "张三";
}
var p = new Person();
console.log(p.name); //张三
```

### 如何改变 this 的指向

```js
var obj = {
  Name: "张三",
  getAge: function() {
    var b = this.Name; //张三
    var fn = function() {
      return this.Name;
    };
    return fn();
  }
};
console.log(obj.getAge()); //underfined

//1.that 来接盘 this

var obj = {
  Name: "张三",
  getAge: function() {
    var b = this.Name; //张三
    var that = this; // 将 this 指向丢给 that
    var fn = function() {
      return that.Name;
    };
    return fn();
  }
};
console.log(obj.getAge()); //张三

//2 箭头函数
var obj = {
  Name: "张三",
  getAge: function() {
    var b = this.Name; //张三
    var fn = () => this.Name;
    return fn();
  }
};
console.log(obj.getAge()); //张三

//利用call()
var obj = {
  Name: "张三",
  getAge: function() {
    var b = this.Name; //张三
    var fn = function() {
      return this.Name;
    };
    return fn.call(obj); //改变fn中this指向，此时fn的this指向调用者obj
  }
};
console.log(obj.getAge()); //张三
```

## new

### 通过 new 创建对象经历 4 个步骤：

- 创建一个新对象 var obj = {};
- 设置新对象的_proto_属性指向构造函数的 prototype 对象 obj. _proto_ = ClassA.prototype;
- 使用新对象调用函数，函数中的 this 被指向新实例对象 ClassA.call(obj);　　//{}.构造函数()
- 返回新对象
```js
    //实现一个new
function _new(fn, ...arg) {
    const obj = Object.create(fn.prototype);  //第二步Object.create（）第一个参数为 新创建对象的原型对象
    const ret = fn.apply(obj, arg);           //第三步
    return ret instanceof Object ? ret : obj;
}


```

## call apply bind

### 概念：

#### call、apply 和 bind 是 Function 对象自带的三个方法，都是为了改变函数体内部 this 的指向。

#### apply 、 call 、bind 三者第一个参数都是 this 要指向的对象，也就是想指定的上下文；

#### apply 、 call 、bind 三者都可以利用后续参数传参。apply、call 二者而言，作用完全一样，只是接受参数的方式不太一样。func.call(this, arg1, arg2); func.apply(this, [arg1, arg2])。bind 是返回对应函数，便于稍后调用；apply 、call 则是立即调用 。

### 代码更加直观：

```js
//有一只猫拥有吃鱼的技能
 const cat = {
        name: '猫',
        eatFish(...args) {
            console.log('this指向=>', this);
            console.log('...args', args);
            console.log(this.name + '吃鱼');
        },
    }
//  有一只猫拥有吃鱼的技能
const dog = {
        name: '狗',
        eatBone(...args) {
            console.log('this指向=>', this);
            console.log('...args', args);
            console.log(this.name + '吃骨头');
        },
 console.log('=================== call =========================');
 //1.狗调用call,在猫的帮助下吃鱼
 cat.eatFish.call(dog, '狗', 'call')
 // this指向=>dog这个对象
 // ...args ["狗", "call"]
 // 狗吃鱼

 //2.猫调用call,在狗的帮助下吃骨头
 dog.eatBone.call(cat,'猫','call')
  // this指向=>cat这个对象
 // ...args ["猫", "call"]
 // 猫吃骨头

 // console.log('=================== apply =========================');
 //3.狗调用apply,在猫的帮助下吃鱼
   cat.eatFish.apply(dog,['狗','apply'])
 // this指向=>dog这个对象
 // ...args ["狗", "apply"]
 // 狗吃鱼

 //4.猫调用apply,在狗的帮助下吃骨头
   dog.eatBone.cat(dog,['猫','apply'])
 // this指向=>cat这个对象
 // ...args ["猫", "apply"]
 // 猫吃骨头

 // console.log('=================== bind =========================');
 //狗学会了吃鱼这个技能，猫学会了吃骨头这个技能
   const test1 = cat.eatFish.bind(dog, '狗', 'bind')
   const test2 = dog.eatBone.bind(cat, '猫', 'bind')
   test1()
 // this指向=>dog这个对象
 // ...args ["狗", "bind"]
 // 狗吃鱼
   test2()
// this指向=>cat这个对象
 // ...args ["猫", "bind"]
 // 猫吃骨头

```

#### 拓展
`实现一个call函数`
```js
 Function.prototype.myCall = function (obj) {
                obj = obj || window
                obj.fn = this
                let arg = [...arguments].slice(1)
                let result = obj.fn(...arg)
                delete obj.fn
                return result
 }           
```

`实现一个apply函数`
```js
  Function.prototype.myApply = function (obj) {
                    obj = obj || window;
                    obj.fn = this;
                    let result = arguments[1] ? obj.fn(...arguments[1]): obj.fn()
                    delete obj.fn;
                    return result;
}

```

`实现一个bind函数`

```js
Function.prototype.myBind = function (obj) {
    let arg = [...arguments].slice(1)
    //var arg = Array.prototype.slice.call(arguments, 1)
    // Array.prototype.slice.call(arguments)能将具有length属性的对象转成数组
    var result = this
    return function () {
        arg = arg.concat([...arguments])
        //arg = arg.concat(Array.prototype.slice.call(arguments))
        return result.apply(obj, arg)
    }
}
```

```js
//测试
        let test = {
            name: 'test'
        }
        let o = {
            name: 'o',
            fn: function () {
                console.log(this.name, ...arguments);  //这里把参数显示一下
            }
        }
        o.fn(1, 2, 3) // "o" 1 2 3
        o.fn.call(test, 1, 2, 3,4) // "test" 1 2 3 4
        o.fn.myCall(test, 1, 2, 3,4) // "test" 1 2 3 4
        o.fn.apply(test,[1,2,4])    //test 1 2  4
        o.fn.myApply(test,[1,2,4])  //test 1 2  4
        o.fn.bind(test,1,6,7)()    //test 1 6 7
        o.fn.myBind(test,1,6,7)()  //test 1 6 7
```


## 闭包

#### 闭包就是能够读取其他函数内部变量的函数。 本质上，闭包是将函数内部和函数外部连接起来的桥梁
- 创建闭包的最常见的方式就是在一个函数内创建另一个函数，通过另一个函数访问这个函数的局部变量,利用闭包可以突破作用链域

```js
//手写一个闭包
function f1() {
  let num = 10;
  function f2() {
    console.log(num);
  }
  return f2();
}
f1();
```
#### 优缺点
用处？
- 1、读取函数内部的变量；
- 2、让这些变量的值始终保持在内存中。不会再f1调用后被自动清除；

优点？
- 1、变量长期驻扎在内存中；
- 2、避免全局污染；
- 3、私有成员的存在，能够实现封装和缓存等；

缺点？
- 1.由于闭包会使得函数中的变量都被保存在内存中，内存消耗很大，所以不能滥用闭包，否则会造成网页的性能问题，在IE中可能导致内存泄露。解决方法是，在退出函数之前，将不使用的局部变量全部删除。
- 2.闭包会在父函数外部，改变父函数内部变量的值。所以，如果你把父函数当作对象（object）使用，把闭包当作它的公用方法（Public Method），把内部变量当作它的私有属性（private value），这时一定要小心，不要随便改变父函数内部变量的值。

#### 应用
```js
   for (let i = 0; i < 5; i++) {
         (function (i) {  // j = i
            setTimeout(function () {
                console.log(i);
            }, 1000);
        })(i);
    }
```
## 函数柯里化
```js
function add(a) {
            function sum(b) { // 使用闭包
                a = a + b; // 累加
                return sum;
            }
            sum.toString = function () { // 重写toSting() 方法
                return a;
            }
            return sum; // 返回一个函数
        }

console.log(add(1)(3)(5)) // 9


最后再扩展一道经典面试题
// 实现一个add方法，使计算结果能够满足如下预期：
add(1)(2)(3) = 6;
add(1, 2, 3)(4) = 10;
add(1)(2)(3)(4)(5) = 15;

function add() {
    // 第一次执行时，定义一个数组专门用来存储所有的参数
    var _args = Array.prototype.slice.call(arguments);

    // 在内部声明一个函数，利用闭包的特性保存_args并收集所有的参数值
    var _adder = function() {
        _args.push(...arguments);
        return _adder;
    };

    // 利用toString隐式转换的特性，当最后执行时隐式转换，并计算最终的值返回
    _adder.toString = function () {
        return _args.reduce(function (a, b) {
            return a + b;
        });
    }
    return _adder;
}

add(1)(2)(3)                // 6
add(1, 2, 3)(4)             // 10
add(1)(2)(3)(4)(5)          // 15
add(2, 6)(1)                // 9
```

## 继承


#### 必问 要求能手写几种继承

```js
//https://juejin.im/post/5c1f9fc0f265da6125781973utm_medium=hao.caibaojian.com&utm_source=hao.caibaojian.com
//以一个父类为前提条件，列举 js 继承的继承方式：
function Person (age) {
  this.age = age || 18
}
Person.prototype.sleep = function () {
  console.log('sleeping')
}

1.原型继承
function Programmer() {}

Programmer.prototype = new Person ()  //实现继承
Programmer.prototype.code = function () {
  console.log('coding')
}

let jon = new Programmer()
jon.code() // coding
jon.sleep() // sleeping

jon instanceof Person // true
jon instanceof Programmer // true

Object.getPrototypeOf(jon) // Person {age: 18, code: ƒ}
jon.__proto__ // Person {age: 18, code: ƒ}

// 特点：继承了父类的模板，又继承了父类的原型对象
// 缺点：来自原型对象的所有属性被所有实例共享,创建子类实例时 无法向父类构造函数传参
```

```js
2.构造函数继承
function Programmer(name) {
  Person.call(this)
  this.name = name
}
let jon = new Programmer('jon')
jon.name // jon
jon.age // 18

jon.sleep() // Uncaught TypeError: jon.sleep is not a function
jon instanceof Person // false
jon instanceof Programmer // true
a2.sleep()  //undinfind 父类的原型对象并没有继承
// 优点：
// 特点：继承了父类的模板，不继承了父类的原型对象
```

```js
3.组合继承（原型+构造函数）
//父类
function Father(name,age){
    this.name = name ;
    this.age = age;
}
//父类的原型对象
Father.protoType.id = 24;

//子类
function Son(name,age,sex){
   father.call(this,name,age)
   this.sex = sex
}

//实现继承
Son.protoType = new Father()
let a3 = new Son('张三',18,'男')
console.log(a3.name); //张三
console.log(a3.age);  //18
a3.sleep() //sleeping
// 特点：既继承了父类的模板，又继承了父类的原型对象。缺点就是son.pertotype = new father()
// 函数又实例一次，函数内部变量又重复实例一次，大程序时候会很好性能。
```

```js
4.ES6继承
//父类
class Father {
    constructor(name,age){
        this.name = name
        this.age = age
    }
    eat(){
        return `${this.name}${this.age}岁了,再吃东西`
    }
}
//子类
class Son extends Father{
    constructor(name,age,sex){
        super(name,age) //调用父类的constructor
        this.sex = sex
    }
    drink(){
           return `${this.name},性别${this.sex},${this.age}岁了,在喝东西`
    }
}
let a4 = new Son('张三',19,'女')
console.log(a4.eat());   //张三19岁了,在吃东西
console.log(a4.drink()); //张三,性别女,19岁了,在喝东西

```

## 深浅拷贝

```js
let a = {
  age: 1
};
let b = a;
b.age = 2;
console.log(a.age); //2
```

从上述例子中我们可以发现，如果给一个变量赋值一个对象，那么两者的值会是同一个引用，其中一方改变，另一方也会相应改变。
通常在开发中我们不希望出现这样的问题，我们可以使用浅拷贝来解决这个问题。

### 浅拷贝

#### 浅拷贝只复制引用，而未复制真正的值

- 1 通过 Object.assign 来解决这个问题

```js
let a = {
  age: 1
};
let b = Object.assign({}, a);
b.age = 2;
console.log(a.age); // 1
```

- 2 通过展开运算符（…）来解决

```js
let a = {
  age: 1
};
let b = { ...a };
b.age = 2;
console.log(a.age); // 1
```

#### 通常浅拷贝就能解决大部分问题了，但是当我们遇到如下情况就需要使用到深拷贝了。

```js
let a = {
  age: 1,
  job: {
    first: "web"
  }
};
let b = Object.assign({}, a);
b.job.first = "java";
console.log(a.job.first); // java
```

浅拷贝只解决了第一层的问题，如果接下去的值中还有对象的话，两者享有相同的引用。此时我们需要引入深拷贝

### 深拷贝

#### 深拷贝就是对目标的完全拷贝，不像浅拷贝那样只是复制了一层引用，就连值也都复制了。只要进行了深拷贝，它们老死不相往来，谁也不会影响谁。

- 1 通过 JSON.parse(JSON.stringify(object)) 来解决

```js
let a = {
  age: 1,
  job: {
    first: "web"
  }
};
let b = JSON.parse(JSON.stringify(a));
b.job.first = "java";
console.log(a.job.first); // web
```

- 2 递归调用”浅拷贝”

```js
对每一层的数据都实现一次 创建对象->对象赋值 的操作

function deepClone(obj){
    var newObj= obj instanceof Array?[]:{};
    for(var i in obj){
       newObj[i] =typeof obj[i]=='object'?  
       deepClone(obj[i]):obj[i];    
    }
    return newObj;
}

function deepClone(source){
    const targetObj = source.constructor === Array ? [] : {}; // 判断复制的目标是数组还是对象
    for(let keys in source){ // 遍历目标
      if(source.hasOwnProperty(keys)){
          if(source[keys] && typeof source[keys] === 'object'){ // 如果值是对象，就递归一下
            argetObj[keys] = source[keys].constructor === Array ? [] : {};
            targetObj[keys] = deepClone(source[keys]);
          }else{ // 如果不是，就直接赋值
            targetObj[keys] = source[keys];
        }
      }
   }
    return targetObj;
}

```

## 事件委托 事件冒泡

1.基本概念？
捕获：自顶向下
冒泡：自底向上
2.window.addEventListener第三个参数默认是false 属于冒泡阶段
第三个参数是true 属于捕获阶段

#### 事件委托：利用事件冒泡原理，给父元素绑定事件，用来监听子元素的冒泡事件，并找到是哪个子元素的事件。`好处是避免对每个字元素添加事件监听器，减少操作 DOM 节点的次数，提高代码的性能。

#### 事件冒泡：当一个元素接收到事件的时候 会把他接收到的事件传给自己的父级，一直到 window

```js
<ul id="ul1">
  <li>测试1</li>
  <li>测试2</li>
  <li>测试3</li>
</ul>;
var allLi = document.getElementsByTagName("li");
for (let i = 0; i < allLi.length; i++) {
  allLi[i].onclick = function(e) {
    alert(e.target.innerHTML);
  };
  // for(let i = 0 ;i < allLi.length;i++){
  //   allLi[i].addEventListener('click',function(e){
  //     alert(`${e.target.innerHTML},索引为：${i}`);
  //   })
  // }
}

//利用事件委托
var oUl = document.getElementById("ul1");
oUl.onclick = function(e) {
  alert(e.target.innerHTML);
};
// oUl.addEventListener('click',function(e){
//   const target = e.target
//   if(target.tagName.toLowerCase() === 'li'){
//     const liList = document.querySelectorAll('li')
//     const index = Array.prototype.indexOf.call(liList,target)
//     alert(`${e.target.innerHTML},索引为：${index}`);
//   }
// })

//案例：给每一个访问的元素添加一个属性 banned = true 不能点击
window.addEventLister('click',function(e){
  if(banner === true){
    e.stopProgagtion()
  }
}，true)


```


### 递归、回调

#### 递归函数：如果一个函数在其主体中直接或间接调用其本身(自己调用自己)，则这样的函数则称为"递归函数"

```js
function fn1(num) {
  if (num == 1) {
    return 1;
  }
  return num * fn1(num - 1);
}
console.log(fn1(5)); //120
```


#### 回调函数:一段可执行的代码段，它作为一个参数传递给其他的代码(函数当做参数传递)，其作用是在需要的时候方便调用这段（回调函数）代码

```js
function example(callback) {
  callback();
  console.log("我是主函数");
}

function fn() {
  setTimeout(_ => {
    console.log("我是回调函数");
  }, 1000);
}
example(fn); // 我是主函数 我是回调函数
```

## Promise

**Promise**是ES6推出的异步编程的一种解决方案。**解决了回调地狱问题，提高了代码的可读性,状态不可逆**，一旦改变则不会再变了；
常用的方法有resolve、reject、then、catch、race、all、allSettled、any、finally。then()方法会返回一个新的Promise实例，所以能够连续then

```js
//实例
function runAsyns() {
  var p = new Promise(function(resolve, reject) {
    //做一些异步操作
    setTimeout(function() {
      resolve("数据1");
    }, 2000);
  });
  return p;
}

runAsyns()
  .then(val => {
    console.log(val); // 数据1
    return new Promise(function(resolve, reject) {
      resolve("数据2");
    });
  })
  .then(val => {
    console.log(val); // 数据2
    return new Promise((resolve, reject) => {
      resolve("数据3");
    });
  })
  .then(val => {
    console.log(val); // 数据3
  });
```

### async await

async/await:是用同步的方式执行异步的操作，generator+Promise的语法糖;它的实现原理，利用Promise嵌套，再加上generator函数的步骤控制，实现了按顺序执行异步操作的效果；
> async函数返回的是一个Promise,正常情况下，await命令后面是一个 Promise 对象，返回该对象的结果。如果不是 Promise 对象，就直接返回对应的值。
```js 
   //先看一段代码
   //单一的 Promise 链并不能发现 async/await 的优势，但是，如果需要处理由多个 Promise 组成的 then 链的时候，优势就能体现出来了（很有意思，Promise 通过 then 链来解决多层回调的问题，现在又用 async/await 来进一步优化它）。
  function takeTime(n){
        return new Promise((resolve,reject)=>{
            setTimeout(() => {
                resolve( (n+200),n)
            }, 1000);
        })
    }
    function step1(n) {
            console.log(`step1 with ${n}`);
            return takeTime(n);
        }

        function step2(n) {
            console.log(`step2 with ${n}`);
            return takeTime(n);
        }

        function step3(n) {
            console.log(`step3 with ${n}`);
            return takeTime(n);
      }
        function step3(n) {
            console.log(`step3 with ${n}`);
            return takeTime(n);
      }
      function doIt(){
         console.time("doIt");
         const time1 = 300;
         step1(time1)
         .then(v => step2(v))
         .then(v => step3(v))
         .then(result=>{
             console.log(result,'end')
         })
      }
     doIt()

     async function doIt2(){
         console.time("doIt2");
         const time1 = 300;
         const time2 = await step1(time1);
         const time3 = await step2(time2);
         const result = await step3(time3);
         console.log(result, 'end')
     }
    doIt2()
```
## 防抖
> 触发高频事件后n秒内函数只会执行一次，如果n秒内高频事件再次被触发，则重新计算时间
> 思路：每次触发事件时都取消之前的延时调用方法
> 应用：
 - 1. 用户在输入框中连续输入一串字符后，只会在输入完后去查询
 - 2. window的resize、scroll事件，不断地调整浏览器的窗口大小、或者滚动时会触发对应事件，防抖让其只触发一次
        
```js
function debounce(fn) {
      let timeout = null; // 创建一个标记用来存放定时器的返回值
      return function () {
        clearTimeout(timeout); // 每当用户输入的时候把前一个 setTimeout clear 掉
        timeout = setTimeout(() => { // 然后又创建一个新的 setTimeout, 这样就能保证输入字符后的 interval 间隔内如果还有字符输入的话，就不会执行 fn 函数
          fn.apply(this, arguments);
        }, 500);
      };
    }
function sayHi() {
    console.log('防抖成功');
}

var inp = document.getElementById('inp');
inp.addEventListener('input', debounce(sayHi)); // 防抖
```

## 节流
> 高频事件触发，但在n秒内只会执行一次，所以节流会稀释函数的执行频率
> 思路：每次触发事件时都判断当前是否有等待执行的延时函数
> 应用：
 - 1. 鼠标连续不断地触发某事件（如点击），只在单位时间内只触发一次
 - 2. 监听滚动事件，比如是否滑到底部自动加载更多
 ```js
 function throttle(fn) {
      let canRun = true; // 通过闭包保存一个标记
      return function () {
        if (!canRun) return; // 在函数开头判断标记是否为true，不为true则return
        canRun = false; // 立即设置为false
        setTimeout(() => { // 将外部传入的函数的执行放在setTimeout中
          fn.apply(this, arguments);
          // 最后在setTimeout执行完毕后再把标记设置为true(关键)表示可以执行下一次循环了。当定时器没有执行的时候标记永远是false，在开头被return掉
          canRun = true;
        }, 500);
      };
    }
function sayHi(e) {
    console.log(e.target.innerWidth, e.target.innerHeight);
}
window.addEventListener('resize', throttle(sayHi));
 ```