# HTML

### 1 浏览器内核
1、IE浏览器内核：Trident内核，也是俗称的IE内核； 
2、Chrome浏览器内核：统称为Chromium内核或Chrome内核，以前是Webkit内核，现在是Blink内核； 
3、Firefox浏览器内核：Gecko内核，俗称Firefox内核； 
4、Safari浏览器内核：Webkit内核； 
5、Opera浏览器内核：最初是自己的Presto内核，后来是Webkit，现在是Blink内核； 
6、360浏览器、猎豹浏览器内核：IE+Chrome双内核；

### 2 BFC块级格式化上下文
BFC 生成了一套封闭的布局空间，内部子元素无论怎么布局，都不会影响到外部的元素
### 怎样才能形成BFC
- float 不是 none 的元素。
- overflow: auto/hidden/scroll 的元素。
- display: table-cell/inline-block 的元素。
- position 不是 static 和 relative 的元素
### BFC 主要作用：
- 1 清除浮动 
- 2 防止同一 BFC 容器中的相邻元素间的外边距重叠问题
### BFC特性:
- 内部box会在垂直方向，一个接一个地放置。
- Box垂直方向的距离由margin决定，在一个BFC中，两个相邻的块级盒子的垂直外边距会产生折叠。
- 在BFC中，每一个盒子的左外边缘（margin-left）会触碰到容器的左边缘(border-left)（对于从右到左的格式来说，则触碰到右边缘）
- 形成了BFC的区域不会与float box重叠
- 计算BFC高度时，浮动元素也参与计算

### 3 重绘与回流
- 重排(回流): 尺寸、布局、结构改变时，引起页面重新构建
- 重绘: 元素外观、风格改变时，不影响布局，则为重绘，因此 损耗较少
- 区别：回流一定引起重绘，重绘不一定引起回流
- 浏览器帮忙：浏览器维护一个队列，把所有引起回流、重绘的操作放入这个队列，等队列到了一定数量或者到了一定的时间间隔，浏览器就会清空队列，进行批量处理
   ####  会触发重排的操作:
    * 页面初次渲染
    * 浏览器窗口大小改变
    * 元素尺寸、位置、内容发生改变
    * 元素字体大小变化
    * 添加或者删除可见的 dom 元素
    * 激活 CSS 伪类（例如：:hover）
    * 查询某些属性或调用某些方法
    * clientWidth、clientHeight、clientTop、clientLeft
    * offsetWidth、offsetHeight、offsetTop、offsetLeft
    * scrollWidth、scrollHeight、scrollTop、scrollLeft
    * getComputedStyle()
    * getBoundingClientRect()
    * scrollTo()

    #### 减少重排和重绘

    * 1.批量修改DOM或者样式
    * 2.动画使用绝对定位让它脱离文档流，不然会影响父元素或后续元素的频繁回流
    - 3、GPU加速：transform、opacity、filters、will-change等样式


