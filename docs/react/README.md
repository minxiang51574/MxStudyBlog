<!--
 * @Author: Mx
 * @Date: 2022-02-26 17:14:45
 * @Description: 
-->
# react

## Why Hook?

### Class Component的问题
- 组件复用困局
- Javascript Class的缺陷
- Function Component缺失的功能
  - Function Component是纯函数，利于组件复用和测试
  - Function Component的问题是只是单纯地接收props、绑定事件、返回jsx，本身是无状态的组件，依赖props传入的handle来响应数据（状态）的变更，所以Function Component不能脱离Class Comnent来存在
  - 所以，Function Comonent是否能脱离Class Component独立存在，关键在于让Function Comonent自身具备状态处理能力，即在组件首次render之后，“组件自身能够通过某种机制再触发状态的变更并且引起re-render”，而这种“机制”就是Hooks！