
# Promise
**Promise作为异步编程的一种解决方案，无论什么阶段的前端都是需要牢牢掌握，在面试中也是属于必问的。**

## 一、高频概念问答

### 1、你理解的Promise?
<details>
    <summary><font color=blue>参考</font></summary> 
   Promise是ES6中异步编程的一种解决方案；它是为了解决异步链式调用出现的回调地狱问题；有三种状态pending进行中、fulfilled成功、rejected失败，且状态一旦改变不可逆；promise.then()是微任务
</details>

### 2、Promise常用方法?
<details>
    <summary><font color=blue>参考</font></summary> 
  Promise.all、Promise.allSettled、Promise.any、Promise.race、Promise.resolve、Promise.reject
</details>

### 3、你理解的async和await?
<details>
    <summary><font color=blue>参考</font></summary> 
 async是ES7中对于异步操作的解决方案，它是Generator函数的语法糖，解决了promise链式调用的问题，用同步的方式去执行异步；
</details>

### 4、Promise.all，Promise.race区别
<details>
    <summary><font color=blue>参考</font></summary> 
 Promise.all() 全部promise成功才算成功，一个promise就算失败，返回成功的数据数组，失败抛出最先失败的promise的reason。 Promise.race() 最先的promise完成则返回，promise结果和最先完成的promise一致
</details>

### 5、执行顺序?
难度 ⭐⭐⭐

- 1. 执行宏任务的过程中，遇到微任务，依次加入微任务队列；
- 2. 当某个宏任务执行完后,会查看是否有微任务队列；
  - 有，执行微任务队列中的所有任务;
  - 没有，读取宏任务队列中最前面任务;
- 3. 栈空后，再次读取微任务队列里的任务，依次类推

```js
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}

async function async2() {
    console.log('async2');
}

console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});

console.log('script end');

// 输出结果

script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```
难度 ⭐⭐⭐⭐

```js
// 在上题中做了一点改动

async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    //async2做出如下更改：
    new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
    });
}
console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();

new Promise(function(resolve) {
    console.log('promise3');
    resolve();
}).then(function() {
    console.log('promise4');
});

console.log('script end');

// 输出结果
script start
async1 start
promise1
promise3
script end
promise2
async1 end
promis4
setTimeout
```

难度 ⭐⭐⭐⭐

```js
console.log('start')
 setTimeout(()=>{
    console.log("children2")
    Promise.resolve().then(()=>{
        console.log("children3")
    })
 },0)
 
 new Promise(function(resolve,reject){
     console.log('children4')
     setTimeout(()=>{ //重点
        console.log("children5")
        resolve("children6")
     },0 )
 }).then(res=>{
     console.log("children7")
     setTimeout(()=>{
        console.log(res)
     },0)
 })
 
 // 输出结果
 start
 children4
 //第一轮宏任务结束 尝试清空微任务队列 没有微任务
 children2
 //第二轮宏任务结束 尝试清空微任务队列 
 children3
 //第三轮
 children5
 children7
 children6

```

## 二、手撕代码
手写 Promise 和 Promise.all 是面试频率最高的；
### 1、Promise.all  难度⭐⭐⭐

> 列举几个关键点：

- 1.return Promise 返回也是Promise
- 2.参数类型判断，传入的参数必须是数组；
- 3.数组元素类型，判断传入的值是否是promise,使用Promise.resolve 方法会把参数转化为promise；
- 4.返回结果顺序问题；
```
function PromiseAll(promiseArray){
    return new Promise((resolve,reject)=>{
        // !!! 考点1
        if(!Array.isArray(promiseArray)){
            return reject(new Error('传入的参数必须是数组'))
        }
        const result = []
        let counter = 0
        const promisenNums = promiseArray.length
        
        // !!! 考点2 判断传入的值是否是promise
        //Object.prototype.toString.call==='[object Promise]'
        
        for(let i = 0 ;i < promisenNums ; i++){
            //Promise.resolve 方法会把参数转化为promise
            Promise.resolve(promiseArray[i]).then(value=>{
                // push会造成数据错乱 用count计数，不用长度判断
                // result.push(value)
                // if(result.length === promisenNums){
                //     resolve(result)
                // }
                //!!! 考点3 promise的顺序问题上面的方式忽略了promise的顺序问题
                
                counter++;
                result[i] = value;
                if(counter === promisenNums){
                    resolve(result)
                }
            }).catch(e=>reject(e))
        }
    })
}
```
### 2、Promise  难度⭐⭐⭐⭐ 
推荐文章  [硬核! 手把手教你写A+规范的Promise](https://juejin.cn/post/6903765174109339655#heading-0)
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
```
### 3、其他手撕 难度⭐⭐⭐
> 掘金有看到其他大佬的文章，就不重复造车，直接上链接
> 
[看了就会，手写 Promise 全部 API 教程](https://juejin.cn/post/7044088065874198536#heading-9)



## 三、大厂真题
### 1、使用Promise实现每隔1秒输出1,2,3,4?

```js
const arr = [1, 2, 3 , 4]
arr.reduce((p, x) => {
  return p.then(() => {
    return new Promise(r => {
      setTimeout(() => r(console.log(x)), 1000)
    })
  })
}, Promise.resolve())

```

### 2、Promise做缓存?


场景：一个频繁调用接口的方法在多处使用

```js

const cacheMap = new Map(); //用一个Map来存

function enableCache(target, name, descriptor) {
	const oldValue = descriptor.value; //拿到原来的方法

	descriptor.value = function(...args) { //重写这个方法
		//因为请求的参数肯定会不一样，所以要定义一个的key
		const cacheKey = name + JSON.stringify(args);
		if (!cacheMap.get(cacheKey)) {
			//为什么要加catch 因为你的请求有可能会报错
			const cacheValue = Promise.resolve(oldValue.apply(this, args)).catch(_ => {
				cacheMap.set(cacheKey, null) //报错了，设置成null
			})
			cacheMap.set(cacheKey, cacheValue)
		}
		return cacheMap.get(cacheKey); //把缓存拿出来即可，无须再去http请求，无须再去请求服务端
	}
	return descriptor;
}

class PromiseClass {
   //装饰器
   @enableCache
   static async getInfo() {}
}

// 使用
PromiseClass.getInfo()
PromiseClass.getInfo()
PromiseClass.getInfo()
```























