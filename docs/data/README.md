
# 一、数据结构

- 数组
- 栈
- 队列
- 链表 
- 树

## 1. 时间复杂度 空间复杂度

### 时间复杂度
时间复杂度看的是代码的执行时间的趋势
- 最简单的O(n)
```js
for (var i = 0; i < n; i++) {   
  sum += i;   
} 
```
- T(n) = O(n²)
```js
function go(i) {
  var sum = 0;
  for (var j = 0; j < i; j++) {
    sum += i;
  }
  return sum;
}
function main(n) {
  var res = 0;
  for (var i = 0; i < n; i++) {
    res = res + go(i); // 这里是重点
  }
}
```

### 空间复杂度
空间复杂度是对一个算法在运行过程中临时占用存储空间大小的量度。和时间复杂度相似，它是内存增长的趋势。
常见的空间复杂度有 O(1)、O(n) 和 O(n^2)
- O(1)
```js
let a = 1;
let b = 1;
let c = 1;
let d = 1;
```
- O(n)
```js
let arr =Array(n)
//代码中创建了一个n长度的数组，很明显数组的长度根据n来决定
```
- O(n²)
```js
let arr=[]
for (var i = 0; i < n; i++) {
    arr[i]=i
    for (var j = 0; j < n; j++) {
      arr[i][j]=j
    }
}
```

## 2. 排序方法
### 冒泡排序
```js
//每次比较相邻的两个数，如果后一个比前一个小，换位置
var arr = [3, 1, 4, 6, 5, 7, 2];
function bubbleSort(arr) {
for (var i = 0; i < arr.length - 1; i++) {
    for(var j = 0; j < arr.length - i - 1; j++) {
        if(arr[j + 1] < arr[j]) {
            var temp;
            temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
return arr;
}
console.log(bubbleSort(arr));
```

### 快速排序
> 采用二分法，取出中间数，数组每次和中间数比较，小的放到左边，大的放到右边
- （1）在数据集之中，找一个基准点
- （2）建立两个数组，分别存储左边和右边的数组
- （3）利用递归进行下次比较
```js
var arr = [3, 1, 4, 6, 5, 7, 2];

function quickSort(arr) {
    if(arr.length == 0) {
        return [];    // 返回空数组
    }
    var cIndex = Math.floor(arr.length / 2);
    var c = arr.splice(cIndex, 1);
    var l = [];
    var r = [];

    for (var i = 0; i < arr.length; i++) {
        if(arr[i] < c) {
            l.push(arr[i]);
        } else {
            r.push(arr[i]);
        }
    }

    return quickSort(l).concat(c, quickSort(r));
}
console.log(quickSort(arr));
```