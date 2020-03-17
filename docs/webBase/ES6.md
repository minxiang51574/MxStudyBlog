<!--
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-29 09:21:47
 * @LastEditTime: 2019-08-29 16:01:47
 * @LastEditors: Please set LastEditors
 -->
# ES6
:::  warning 这里只归档常用的
详情文档 [阮一峰ECMAScript 6 入门](http://es6.ruanyifeng.com/#docs/let)
:::

## 变量声明
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

## 字符串拼接

```js
//before
const a = "html";
const b = 'css' + a + 'js';
//now
const a = 'html';
const b = `css${a}js`;

```
## 解构
```js
let arr = ['a', 'b', 'c', 'd'];
console.log(...arr) //a b c d
 ```
```js
const arr = ['a', 'b', 'c', 'd'];

// before
const first = arr[0];
const second = arr[1];

// now
const [first, second] = arr;
```
```js
// before
function getName(user) {
  const first = user.first;
  const last = user.last;
}

// now
function getName({ first, last }) {
}
```


### map 遍历 映射
```js
使用频率非常高 返回一个数组对象 我们要拿到数组所有的name
 let data = [
        {name: "科比", "age": "30",id:1},
        {name: "王治郅",  "age": "29",id:2},
        {name: "姚明", "age": "28",id:3}
    ];
 let nameList = data.map(item =>item.name)  // ["科比", "王治郅", "姚明"]

 reduce实现map
 let nameList2 = data.reduce((prev,cur)=>{
        prev.push(cur.name)
        return prev 
    },[])
```
### filter 过滤

```js
使用频率同样非常高 返回一个数组对象 我们需要过滤掉数组中特定的项 如年龄>=29
 let data = [
        {name: "科比", "age": "30",id:1},
        {name: "王治郅",  "age": "29",id:2},
        {name: "姚明", "age": "28",id:3}
    ];
 let ageList = data.filter(item =>item.age >= 29)  // {name: "科比", age: "30", id: 1}
                                                 //  {name: "王治郅", age: "29", id: 2}

 reduce实现filter
 let ageList2 = data.reduce((prev,cur)=>{
        if (cur.age >= 29) {
            prev.push(cur);
        }
        return prev
    },[])

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


## 其它
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


