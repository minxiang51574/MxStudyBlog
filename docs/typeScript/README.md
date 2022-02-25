# 真题
## typescript 的特点

- 可以在编译期间发现并纠正错误
- 提高可维护性
- 提高协同开发的效率
- 支持强类型、接口、泛型、模块
## 1 手写体：使用TypeScript 实现一个 get 函数来获取它的属性值
```
const data = { name: 'tom', age: 18, address: 'xxx' }
```
解答
```
const get = <T extends object, K extends keyof T>(obj: T, key: K): T[K] => {
  return obj[key]
}
```

## 2 ts中的 any 、 unknown 的区别？
- any：变量如果是 any 类型，绕过所有类型检查，直接可使用
- unknown：变量如果是 unknow 类型，需要判断完是什么类型之后才能使用

## 3 有用过ts中的 keyof 吗？
将一个interface的所有key，汇聚成一个联合类型，可以用来对传入key的限制，比如：
```
interface Target {
  name: string,
  age: number
}

const fn = (obj: Target, key: keyof Target) => {}

const obj: Target = { name: 'sunshine', age: 18 }

fn(obj, name) // 成功
fn(obj, age) // 成功
fn(obj, height) // 报错
```
