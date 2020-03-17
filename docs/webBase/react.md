# react

### 声明式编程 vs 命令式编程
声明式编程的编写方式描述了应该做什么，而命令式编程描述了如何做。在声明式编程中，让编译器决定如何做事情。声明性程序很容易推理，因为代码本身描述了它在做什么。

### 什么是函数式编程
函数式编程是声明式编程的一部分。javascript中的函数是第一类公民，这意味着函数是数据，你可以像保存变量一样在应用程序中保存、检索和传递这些函数。

### 函数式编程的好处是什么？
1 函数式编程让我们的代码更清晰，每个功能都是一个函数。
2 函数是数据，你可以像保存变量一样在应用程序中保存、检索和传递这些函数。
3 函数式编程为我们的代码测试代理了极大的方便，更容易实现前端自动化测试。

### 什么是React
React是一个简单的javascript UI库，用于构建高效、快速的用户界面。它是一个轻量级库，因此很受欢迎。它遵循组件设计模式、声明式编程范式和函数式编程概念，以使前端应用程序更高效。它使用虚拟DOM来有效地操作DOM。它遵循从高阶组件到低阶组件的单向数据流。

### React 与 Angular 有何不同？
Angular是一个成熟的MVC框架，带有很多特定的特性，比如服务、指令、模板、模块、解析器等等。React是一个非常轻量级的库，它只关注MVC的视图部分。
Angular遵循两个方向的数据流，而React遵循从上到下的单向数据流。React在开发特性时给了开发人员很大的自由，例如，调用API的方式、路由等等。我们不需要包括路由器库，除非我们需要它在我们的项目

### 什么是Virtual DOM
Virtual DOM 是一个轻量级的 JavaScript 对象，它最初只是 real DOM 的副本。它是一个节点树，它将元素、它们的属性和内容作为对象及其属性

### 什么是 JSX
JSX是javascript的语法扩展。它就像一个拥有javascript全部功能的模板语言。它生成React元素，这些元素将在DOM中呈现。React建议在组件使用JSX。在JSX中，我们结合了javascript和HTML，并生成了可以在DOM中呈现的react元素。

### diff算法?
把树形结构按照层级分解，只比较同级元素。
给列表结构的每个单元添加唯一的key属性，方便比较。

### 生命周期
#### componentWillMount()
在渲染前调用,在客户端也在服务端，它只发生一次。

#### componentDidMount()
在第一次渲染后调用，只在客户端。之后组件已经生成了对应的DOM结构，可以通过this.getDOMNode()来进行访问。 如果你想和其他JavaScript框架一起使用，可以在这个方法中调用setTimeout, setInterval或者发送AJAX请求等操作(防止异部操作阻塞UI)。

#### componentWillReceiveProps()
在组件接收到一个新的 prop (更新后)时被调用。这个方法在初始化render时不会被调用

#### shouldComponentUpdate()
返回一个布尔值。在组件接收到新的props或者state时被调用。在初始化时或者使用forceUpdate时不被调用。 可以在你确认不需要更新组件时使用（性能优化）判断是否更新当前组件信息 现在可以PureComponent提升性能

#### componentWillUpdate()
在组件接收到新的props或者state但还没有render时被调用。在初始化时不会被调用。

#### componentDidUpdate()
在组件完成更新后立即调用。在初始化时不会被调用。

#### componentWillUnMount()
组件从 DOM 中移除的时候立刻被调用。

### 什么是 React Router Dom 及其工作原理
react-router-dom是应用程序中路由的库。 React库中没有路由功能，需要单独安装react-router-dom。
react-router-dom 提供两个路由器BrowserRouter和HashRoauter。前者基于url的pathname段，后者基于hash段。

### react-router-dom 组件
 - BrowserRouter 和 HashRouter 是路由器
 - Route 用于路由匹配
 - Link 组件用于在应用程序中创建链接。 它将在HTML中渲染为锚标记
 - NavLink是突出显示当前活动链接的特殊链接
 - Switch 不是必需的，但在组合路由时很有用
 - Redirect 用于强制路由重定向

### 如何提高性能
 - 适当地使用shouldComponentUpdate生命周期方法。 它避免了子组件的不必要的渲染。 如果树中有100个组件，则不重新渲染整个组件树来提高应用程序性能
 - 使用create-react-app来构建项目，这会创建整个项目结构，并进行大量优化
 - 不可变性是提高性能的关键。不要对数据进行修改，而是始终在现有集合的基础上创建新的集合，以保持尽可能少的复制，从而提高性能
 - 在显示列表或表格时始终使用 Keys，这会让 React 的更新速度更快
 - 代码分离是将代码插入到单独的文件中，只加载模块或部分所需的文件的技术

 ### redux工作流程

 ![dd](../redux.jpg)

 ### （React）setState为什么异步？能不能同步？什么时候异步？什么时候同步？
- setState 只在合成事件和钩子函数中是“异步”的，在原生事件和 setTimeout 中都是同步的。

- 合成事件：就是react 在组件中的onClick等都是属于它自定义的合成事件

- 原生事件：比如通过addeventListener添加的，dom中的原生事件

### Redux-thunk
使用了redux-thunk后，store中reducer就不仅仅接受一个action对象了，它可以接受一个函数了

```js
//actionCreators
//普通action
export const getInitListData = (value) => ({
  type: INIT_LIST_DATA,
  value
})
// 函数
export const getTodoList = () => {
  return (dispatch) => {
    axios
      .get('/api/list.json')
      .then((res) => {
        const list = res.data;
        const action = getInitListData(list);
        dispatch(action);
      })
  }
}
```


### Redux-saga
