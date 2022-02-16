# HTML

## html语义化
根据内容的结构化（内容语义化），选择合适的标签（代码语义化）便于开发者阅读和写出更优雅的代码
### 块级元素
div、p、h1~h6、ul、ol、li、table1

### 行内元素
span、img、a、b、lable、input

### 浏览器内核
1、IE浏览器内核：Trident内核，也是俗称的IE内核； 
2、Chrome浏览器内核：统称为Chromium内核或Chrome内核，以前是Webkit内核，现在是Blink内核； 
3、Firefox浏览器内核：Gecko内核，俗称Firefox内核； 
4、Safari浏览器内核：Webkit内核； 
5、Opera浏览器内核：最初是自己的Presto内核，后来是Webkit，现在是Blink内核； 
6、360浏览器、猎豹浏览器内核：IE+Chrome双内核；

### BFC 块级格式化
BFC 生成了一套封闭的布局空间，内部子元素无论怎么布局，都不会影响到外部的元素
#### 怎样才能形成BFC
- float 不是 none 的元素。
- overflow: auto/hidden/scroll 的元素。
- display: table-cell/inline-block 的元素。
- position 不是 static 和 relative 的元素
### BFC 主要的作用是：1 清除浮动 2 防止同一 BFC 容器中的相邻元素间的外边距重叠问题
### BFC特性
- 内部box会在垂直方向，一个接一个地放置。
- Box垂直方向的距离由margin决定，在一个BFC中，两个相邻的块级盒子的垂直外边距会产生折叠。
- 在BFC中，每一个盒子的左外边缘（margin-left）会触碰到容器的左边缘(border-left)（对于从右到左的格式来说，则触碰到右边缘）
- 形成了BFC的区域不会与float box重叠
- 计算BFC高度时，浮动元素也参与计算

### 重绘与回流
- 重排(回流): 当元素的尺寸、结构或触发某些属性时，浏览器会重新渲染页面，称为重排。此时，浏览器需要重新经过计算，计算后还需要重新页面布局，因此是较重的操作。
- 重绘: 当元素样式的改变不影响布局时，浏览器将使用重绘对元素进行更新，此时由于只需要UI层面的重新像素绘制，因此 损耗较少。
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

    回流必定触发重绘，重绘不一定触发回流。重绘的开销较小，回流的代价较高

    #### 减少重排和重绘

    * 1.不要一条一条地修改 DOM 的样式。可以先定义好 css 的 class，然后修改 DOM 的 className
    * 2.为动画的 HTML 元件使用 fixed 或 absoult 的 position，那么修改他们的 CSS 是不会重排的


