# 高频手写

## 1 防抖（debounce）
>当你持续触发事件时，只有某一次的操作后在指定的时间内没有再操作，这一次才被判定有效；如果在这时间段内又被触发，重新计时。（某个函数在某段时间内，无论触发了多少次回调，都只执行最后一次）

#### 使用场景
input搜索联想词、window触发resize

#### 简化版
```js
function debounce(fn, wait = 50) {
    // 通过闭包缓存一个定时器 id
    let timer = null
    // 将 debounce 处理结果当作函数返回 
    // 触发事件回调时执行这个返回函数
    return function(...args) {
      	// 如果已经设定过定时器就清空上一次的定时器
        if (timer) {clearTimeout(timer)}
      	// 开始设定一个新的定时器，定时器结束后执行传入的函数 fn
        timer = setTimeout(() => {
            fn.apply(this, args)
        }, wait)
    }
}
```

这是一个简单版的防抖，但是有缺陷，这个防抖只能在最后调用。一般的防抖会有immediate选项，表示是否立即调用。这两者的区别，举个栗子来说：
- 例如在搜索引擎搜索问题的时候，我们当然是希望用户输入完最后一个字才调用查询接口，这个时候适用延迟执行的防抖函数，它总是在一连串（间隔小于wait的）函数触发之后调用
- 例如用户给interviewMap点star的时候，我们希望用户点第一下的时候就去调用接口，并且成功之后改变star按钮的样子，用户就可以立马得到反馈是否star成功了，这个情况适用立即执行的防抖函数，它总是在第一次调用，并且下一次调用必须与前一次调用的时间间隔大于wait才会触发
  

```js
/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
function debounce (func, wait = 50, immediate = true) {
  let timer, context, args
  // 延迟执行函数
  const later = () => setTimeout(() => {
    // 延迟函数执行完毕，清空缓存的定时器序号
    timer = null
    // 延迟执行的情况下，函数会在延迟函数中执行
    // 使用到之前缓存的参数和上下文
    if (!immediate) {
      func.apply(context, args)
      context = args = null
    }
  }, wait)
  // 这里返回的函数是每次实际调用的函数
  return function(...params) {
    // 如果没有创建延迟执行函数（later），就创建一个
    if (!timer) {
      timer = later()
      // 如果是立即执行，调用函数
      // 否则缓存参数和调用上下文
      if (immediate) {
        func.apply(this, params)
      } else {
        context = this
        args = params
      }
    // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
    // 这样做延迟函数会重新计时
    } else {
      clearTimeout(timer)
      timer = later()
    }
  }
}
```

总结一下:
- 对于按钮防点击来说的实现：如果函数是立即执行的，就立即调用，如果函数是延迟执行的，就缓存上下文和参数，放到延迟函数中去执行。一旦我开始一个定时器，只要我定时器还在，你每次点击我都重新计时。一旦你点累了，定时器时间到，定时器重置为 null，就可以再次点击了
- 对于延时执行函数来说的实现：清除定时器ID，如果是延迟调用就调用函数



## 2 节流（throttle）
> 当你持续触发事件的时候，规定时间内，只触发一次。（固定时间段 固定时间间隔）;

#### 使用场景
按钮连续点击 、scroll

#### 简化版
```js
// 时间戳
// 当触发事件的时候，取出当前的时间戳，然后减去之前的时间戳（初始设置为 0）
// 结果大于设置的时间周期，则执行函数，然后更新时间戳为当前时间戳
// 结果小于设置的时间周期，则不执行函数

function throttle(fn, wait = 50) {
        let last = 0; // 上次执行时间 第一次马上执行
        return function(...args) {
           let nowTime = +new Date(); // 当前时间
            // 当前时间-上次执行的时间是否超过间隔时间 就执行回调
            if (nowTime - last > wait) {
                fn.apply(this, args)
                last = nowTime; // 重置上次执行时间为当前时间 方便下次执行
          }
    };
}
// 定时器实现
// 当触发事件的时候，设置一个定时器
// 再次触发事件的时候，如果定时器存在，就不执行，知道定时器执行，然后执行函数，清空定时器
// 设置下个定时器
function throttle(fn, wait) {
  var timer, context, args;
  return function() {
    context = this;
    args = arguments;
    // 如果定时器存在，则不执行
    if (!timer) {
      timer = setTimeout(function() {
        // 执行后释放定时器变量
        timer = null;
        fn.apply(context, args);
      }, wait);
    }
  };
}

```
> 防抖动和节流本质是不一样的。防抖动是将多次执行变为最后一次执行，节流是将多次执行变成每隔一段时间执行

## 3 数组扁平化（flat）
```js
const arr = [1, [2, [3, [4, 5]]], 6];
```

```js
//第一种 使用flat
const result = arr.flat(Infinity)

//第二种 使用reduce
function flatFun(arr){
    return arr.reduce((prev,cur)=>{
        return prev.contact(Array.isArray(cur) ? flatFun(cur) : cur )
    },[])
}

// 第三种 递归
let result = [];
function flatFun(arr){
    arr.forEach(item=>{
        if(Array.isArray(cur)){
            flatFun(cur)
        }else{
            result.push(cur)
        }
    })
}
```
## 4 数组去重

```js
let arr =[1,2,3,4,5,3,2,1]
```

```js
//第一种
Array.from(new Set(arr))

//第二种
[...new Set(arr)]
       
//第三种ES5
let newArr = [];
for(let i = 0 ; i < arr.length ; i++){
    if(newArr.indexOf(arr[i]) === -1){
	   newArr.push(arr[i])
    }
}
```

## 5 数组对象去重
```js
let person = [{ id: 0, name: "张三" },
              { id: 1, name: "张三" },
              { id: 2, name: "李四" },
              { id: 3, name: "李四" },
              { id: 4, name: "王麻子"}];
```

```js
// 第一种 reduce
let obj = {}
let person1 = person.reduce((prev,cur)=>{
    obj[cur.name] ? "" : obj[cur.name] = true && prev.push(cur)
    return prev
},[])

// 第二种 new set
let isIn = new Set()
let checkArr = []
person.forEach(item=>{
    if(!isIn.has(item.name)){
        isIn.add(item.name)
        checkArr.push(item)
    }
})
```

## 6 深拷贝（deepClone）
```js
//第一种
let newObj = JSON.parse(JSON.stringfy(oldObj))

//第二种
function deepClone(obj){
    let result;
     //判断是否是简单数据类型
    if(typeof obj == "object" ){
        result = obj instaceof Array ? [] : {}
        for(let i in obj){
           result[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i]
        }
    }else {
        //简单数据类型 赋值
        result = obj
    }
    return result
}
```

## 7 实现一个instanceof
```js
function myInstanceof(obj,obj2){
    let left = obj._proto_;
    let right = obj2.prototype;
    while(true){
        if(left === null){ //找到最顶层
            return false
        }
        if(left === right){
            return true
        }
        left = left._proto_; //没找到就往上找
    }
}
console.log(myInstanceof("22",Number))
console.log(myInstanceof({a:1},Object))

```

## 8 实现一个promise
promise三种状态：pending,fulfilled,rejected
```js
//简单版promise
class Promise {
    constructor(executor){
        this.status = "pending"  //创建时的状态
        this.value = null // 当前值
        this.reason = null //失败原因

          //resolve 函数
        const resolve = (value) => {
            if(this.status === 'pending'){
                this.status = 'fulfilled'
                this.value = value 
            }
        }

         //reject 函数
        const reject = (reason) => {
            if(this.status === 'pending'){
                this.status = 'rejected'
                this.reason = reason 
            }
        }

         //捕获异常
        try{
            executor(resolve,reject)
        } catch (err){
            reject(err)
        }
    }
  
    then(onFulfilled,onRejected){
        //成功的回调
        if(this.status === 'fulfilled'){
            onFulfilled(this.value)
        }
        //失败的回调
        if(this.status === 'rejected'){
            onRejected(this.reason)
        }
    }
}


// case1
const promise = new Promise((resolve,reject)=>{
  resolve('success')
  reject('error')
})
promise.then(
  value=> console.log(value),
  reason=> console.log(reason),
)
// => 'success' 先resolve了状态发生了变化，所以后面的reject不会执行


```
但是如何then里面如果是异步代码，resolve或reject就不会执行，因为那个时候状态还是pennding。
类似**发布订阅**
```js
class Promose {
    constructor(executor){
        this.status = 'pending'
        this.value = null 
        this.reason = null
        
        this.onResolvedCallbacks = [] //存放成功的回调函数 新加
        this.onRejectedCallbacks = [] //存放失败的回调函数 新加


        //reslove函数
        const resolve = (value) => {
            if(this.status === 'pending'){
                 this.status = 'fulfilled'
                 this.value = value 

                 //执行所有的订阅的fulfilled函数 新加
                this.onResolvedCallbacks.forEach(fn=>fn())
            }
        }
        //reject函数
        const reject = (reason) => {
            if(this.status === 'pending'){
                this.status = 'rejected'
                this.reason = reason

                //执行所有的订阅的rejected函数
                this.onRejectedCallbacks.forEach(fn=>fn())
            }
        }
        try{
            executor(resolve,reject)
        }catch(err){
            reject(err)
        }
    }

    then(onFulfilled,onRejected){
        //成功的回调
        if(this.status = 'fulfilled'){
            onFulfilled(this.value)
        }
        //失败的回调
        if(this.status = 'rejected'){
            onRejected(this.reason)
        }

        //如果是等待状态，就把res,rej的处理回调函数放入对应的队列 新加
        if(this.status ==='pending'){
            //放入成功回调队列
            this.onResolvedCallbacks.push(()=>{
                //写额外的逻辑
                onFulfilled(this.value)
            })

            //放入失败回调队列
            this.onRejectedCallbacks.push(()=>{
                //写额外的逻辑
                onRejected(this.reason)
            })
        }
    }
}

// case2
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('success')
  }, 1000)
  setTimeout(() => {
    reject('error')
  }, 2000)
})

promise.then(
  value => {
    console.log(value, '1')
  },
  err => {
    console.log(err)
  }
)
// => 一秒后:
// success1

```

## 9 实现一个promise.all
```js
function PromiseAll(promiseArray){
    return new Promise((resolve,reject)=>{
        if(!Array.isArray(promiseArray)){
            return reject(new Error('传入的参数必须是数组'))
        }
        const result = []
        let counter = 0
        const promisenNums = promiseArray.length
        //判断传入的值是否是promise
        //Object.prototype.toString.call==='[object Promise]'
        for(let i = 0 ;i < promisenNums ; i++){
            //Promise.resolve 方法会把参数转化为promise
            Promise.resolve(promiseArray[i]).then(value=>{
                // result.push(value)
                // if(result.length === promisenNums){
                //     resolve(result)
                // }
                //上面的方式忽略了promise的顺序问题
                counter++;
                result[i] = value;
                if(counter === promisenNums){
                    resolve(result)
                }
            }).catch(e=>reject(e))
        }
    })
}
//测试
const pro1 = new Promise((res,rej)=>{
    setTimeout(()=>{
        res('1')
    },1000)
})
const pro2 = new Promise((res,rej)=>{
    setTimeout(()=>{
        res('2')
    },2000)
})
const pro3 = new Promise((res,rej)=>{
    setTimeout(()=>{
        res('3')
    },3000)
})
const proAll = PromiseAll([pro1,pro2,pro3])
    .then(res=>{
            console.log(res)
    }).catch(e=>{
        console.log(e)
    })
```

## 10 reduce实现一个map
```js

Array.prototype._map = function(fn,callbackThis){
    let result = []
    let cbThis = callbackThis || null
    //call的第一个参数为null 则指向全局对象
    this.reduce((prev,cur,index,arr)=>{
        //传入map回调函数的参数
        result.push(fn.call(callbackThis,cur,index,arr))
    },null)
    return result;
}

Array.prototype._map = function (fn) {
  if(typeof fn === 'function') {
    return this.reduce((prev,item,index,arr) => {
      prev.push(fn(item, index, arr))
      return prev
    }, [])
  } else {
    console.log(new Error('callback is not function'))
  }
}

```

## 11 reduce实现一个filter
```js
Array.prototype._filter = function(fn){
    if(typeof fn === 'function'){
        return this.reduce((prev,item,index,arr)=>{
            fn(item,index,arr)?prev.push(item):null
            return prev
        },[])
    }else {
        console.log(new Error('callback is not function'))
    }
}
```

## 12 计算数组中每个元素出现的次数
```js
let x = [12,12,12,1,1,5,6,7,'8','12']
let y = x.reduce((prev,cur,curIndex,arr)=>{
    prev[cur] ? prec[cur]++ :prev[cur] = 1
    return prev
},{})
console.log(y)

```