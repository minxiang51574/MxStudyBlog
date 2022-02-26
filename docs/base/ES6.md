# ES6

详情文档 [阮一峰ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs)

## 1、变量声明
### 用let不用var
经典面试题
```js
for (var i = 0; i < 5; i++) {
		setTimeout(function (){
			console.log(i);//55555
		}, 1000)
	}
	console.log(i);// 5
```
上面代码先输出顺序依次为5,55555
*如果期望代码的输出变成：5 -> 0,1,2,3,4，该怎么改造代码？
```js
    for (var i = 0; i < 5; i++) {
	    (function(j) {  // j = i
		    setTimeout(function() {
			    console.log(j);
		    }, 1000);
	    })(i);
    }
    console.log(i);
```
这样会得到我们想要的输出结果，这里运用到了声明即执行的函数表达式来解决闭包的问题。
但是作为菜鸟并不能很深入的理解其原理，只能强行记住。有更简单的方法吗?
```js
for (let i = 0; i < 5; i++) {
        setTimeout(function (){
          console.log(i);//01234
        }, 1000)
      }
    console.log(i);// i is not defined
```
简单很多。基本用法不多赘述。let走你，放弃var吧

### const
const一旦声明不可以被更改 常用来声明全局变量

## 2、箭头函数

### 箭头函数和普通函数的区别？
- 1.改变this的指向，会捕获其所在的上下文的this值，作为自己的this值
- 2.箭头是匿名函数，不能作为构造函数，不能使用new。
- 3.箭头函数不绑定arguments，取而代之用rest参数...解决
- 4.箭头函数没有原型属性

### 箭头函数在什么情况下不适用
- 1.定义对象的方法时
- 2.定义原型方式时
- 3.构造函数 

## 3、模板字符串、解构赋值、剩余参数
```js
//模板字符串
//before
const a = "html";
const b = 'css' + a + 'js';
//now
const a = 'html';
const b = `css${a}js`;
```

```js
//解构赋值
let arr = ['a', 'b', 'c', 'd'];
console.log(...arr) //a b c d

// before
const first = arr[0];
const second = arr[1];
// now
const [first, second] = arr;

// before
function getName(user) {
  const first = user.first;
  const last = user.last;
}
// now
function getName({ first, last }) {
}
let { num:num2 } = { num1 : 1}
// num2 : 1

//剩余参数
function rest(num,...rest){
    console.log(rest) //[2, 3, 4]
}
rest(1,2,3,4)
```

## 4、Set、Map

### Set
```js
const set = new Set([1, 2, 3, 4, 4]);
[...set]
// [1, 2, 3, 4]
```
#### 常用方法
> add、delete、has、clear

#### WeakSet 
- WeakSet 的成员只能是对象
- WeakSet 中的对象都是弱引用，即垃圾回收机制不考虑 WeakSet 对该对象的引用

### Map
```js
const map = new Map([
  ['name', '张三'],
  ['title', 'Author']
]);

map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"
```

#### 常用方法
> set、get、delete、has、clear

#### WeakSet 
- WeakMap只接受对象作为键名
- WeakMap的键名所指向的对象，不计入垃圾回收机制
## 5、Promise

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



## 6、其它
### Object.assign 对象的拷贝
```js
第一个对象为目标对象，如果有相同的属性，会被后面的对象覆盖
const object2 = {
		a: 1,
		b: 2,
		c: 3,
        d: 4
	};
    const object1 = {
	    M: '科比',
	    b: '库里',
	    c: '杜兰特'
    };
let newObj = Object.assign(object1,object2)
console.log(newObj);   // {M: "科比", b: 2, c: 3, a: 1, d: 4}
console.log(object1);  // {M: "科比", b: 2, c: 3, a: 1, d: 4}
```

### ES7 includes()判断元素是否存在
```js
['a', 'b', 'c'].includes('a')     // true
```

### reduce
```js
callback （执行数组中每个值的函数，包含四个参数）
    1、previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
    2、currentValue （数组中当前被处理的元素）
    3、index （当前元素在数组中的索引）
    4、array （调用 reduce 的数组）
initialValue （作为第一次调用 callback 的第一个参数）


var  arr = [1, 2, 3, 4];
var sum = arr.reduce((x,y)=>x+y)
var mul = arr.reduce((x,y)=>x*y)
console.log( sum ); //求和，10
console.log( mul ); //求乘积，24

```


