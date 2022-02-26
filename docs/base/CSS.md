# CSS

## 1、盒子模型

- **content-box (W3C 标准盒模型)**
  ::: tip 在标准的盒子模型中
  width 指 content 部分的宽度
  :::

- **border-box (IE 盒模型)**
  ::: warning 在 IE 盒子模型中
  width 表示 content+padding+border 这三个部分的宽度
  :::

### box-sizing 的使用

box-sizing 的默认属性是 content-box  
box-sizing: content-box 是 W3C 标准盒模型  
box-sizing: border-box 是 IE 盒模型

## 2、居中布局

- **水平居中**:

  1.行内元素: `text-align:center` <br>
  2.块级元素: `margin: 0 auto` <br>
  3.绝对定位和移动: `absolute + transform` <br> 
  4.绝对定位和负边距: `absolute + margin` <br> 
  5.flex布局: `flex + justify-content:center`<br> 

- **垂直居中**:

  1.`line-height: height `<br> 
  2.`absolute + transform `<br> 
  3.`flex + align-items: center`

- **水平垂直居中**:

  1. `absolute + transform`
  2. `flex + justify-content + align-items`

## 3、左侧固定，右边自适应(推荐4/5)

```css
//方法1  浮动布局
//先让固定宽度的div浮动,使其脱离文档流,margin-left的值等于固定div的宽度相等。
        .left{
            width: 200px;
            background-color: bisque;
            float: left;
        }
        .right{
            margin-left:200px;
           background-color: #000000;
        }

//方法2  定位
//父元素相对定位 .left绝对定位
        .left{
            width: 200px;
            background-color: bisque;
            position: absolute;   //对比方法1 float:left
        }
        .right{
            margin-left:200px;
           background-color: #000000;
        }

//方法3  calc()计算属性 需要兼容
// 注意两个div必须一左一右浮动,calc的宽度必须要减去的宽度要与固定宽度保持一致

        .left{
            width: 200px;
            background-color: bisque;
            float: left;
        }
        .right{
             float: right;
             width:  calc(100% - 200px);
             background-color: #000000;
        }

//方法4  flex 需要兼容
        section{
            display:flex;
        }
        .left{
            width: 200px;
            background-color: bisque;
        }
        .right{
           flex: 1;
           background-color: #000000;
        }

//方法5  grid 网格布局 
section{

             display: grid;
            grid-template-rows: 100px;
            grid-template-columns: 200px auto 200px;
        }

```
## 4、选择器优先级

- **!important > 行内样式 > #id > .class > tag > \* > 继承 > 默认**
- **选择器 从右往左 解析**

## 5、清除浮动

#### 去除浮动影响，防止父级高度塌陷

- **对父级设置适合 CSS 高度**
- **对父级设置 overflow:hidden**
- **对下面盒子设置 clear: both 表示自己的内部元素，不受其他盒子的影响**
- **伪元素**
  ```css
  .clearFix:after{
      content:'',
      height:0,
      line-height:0
      display:block,
      visibility:hidden,
      clear:both,
      
  }
  .clearFix{
      zoom:1
  }
  ```
## 6、三角形

设置边框的宽度与颜色
```js
 .box{
	width:0px;
	height:0px;
	border-width: 50px;
     border-style: solid;
	border-color:transparent transparent transparent #ef4848;
}

.box{
	width:0px;
	height:0px;
	border: 50px solid transparent;
	border-left:50px solid #ef4848;
}

//三角箭头  正方形设置两边颜色然后旋转
.box{
    width: 12px;
    height: 12px;
    border-right: 1px solid #000;
    border-bottom: 1px solid #000;
    transform: rotate(225deg);
}

```

## 7、H5C3

### H5 新增

- **标签**

  - 语义化更好的内容标签（header,nav,footer,aside,article,section）
  - 音频、视频 API(audio,video)
  - 画布(Canvas) API

- **缓存 sessionStorage localStorage cookie 异同**

  **localStorage**和**sessionStorage**的存储数据大小一般都是 5MB,单个**cookie**保存的数据不能超过 4kb。localStorage 和 sessionStorage 都保存在客户端，不与服务器进行交互通信。

  **localStorage**的生命周期是永久的，关闭页面或浏览器之后 localStorage 中的数据也不会消失。localStorage 除非主动删除数据，否则数据永远不会消失。

  **sessionStorage**的生命周期是在仅在当前会话下有效。sessionStorage 引入了一个“浏览器窗口”的概念，sessionStorage 是在同源的窗口中始终存在的数据。只要这个浏览器窗口没有关闭，即使刷新页面或者进入同源另一个页面，数据依然存在。但是 sessionStorage 在关闭了浏览器窗口后就会被销毁。同时独立的打开同一个窗口同一个页面，sessionStorage 也是不一样的

  **cookie**如果不在浏览器中设置过期时间，cookie 被保存在内存中，生命周期随浏览器的关闭而结束，这种 cookie 简称会话 cookie。如果在浏览器中设置了 cookie 的过期时间，cookie 被保存在硬盘中，关闭浏览器后，cookie 数据仍然存在，直到过期时间结束才消失

  应用场景：localStoragese：常用于长期登录（+判断用户是否已登录），适合长期保存在本地的数据。sessionStorage：敏感账号一次性登录；cookie：判断用户是否登陆过网站，以便下次登录时能够实现自动登录（或者记住密码）

           setItem (key, value) ——  保存数据，以键值对的方式储存信息。

      　　 getItem (key) ——  获取数据，将键值传入，即可获取到对应的value值。

        　 removeItem (key) ——  删除单个数据，根据键值移除对应的信息。

        　　clear () ——  删除所有的数据

        　　key (index) —— 获取某个索引的key

### CSS3 新增

- **属性**

  - border-color border-radius box-shadow background-size background-origin 等新特性

- **transform 变换**

  - translate 移动
  - rotate 旋转
  - scale 缩放
  - skew 倾斜

- **transition 过渡**

  - transition-property 属性
  - transition-duration 时长
  - transition-timing-function 曲线
  - transition-delay 延迟

- **animation / keyframes 动画**
  - animation-name: 动画名称，对应@keyframes
  - animation-duration: 间隔
  - animation-timing-function: 曲线
  - animation-delay: 延迟
  - animation-iteration-count: 次数 ——infinite: 循环动画
  - animation-direction: 方向 ——alternate: 反向播放

## 8、css控制文本内容显示省略号
### 1，单行文字显示省略号
```css
div{
　　width:200px;
　　overflow:hidden;
　　white-space:nowrap;
　　text-overflow:ellipsis;
}
```
### 2，多行文字显示省略号
```css
div{
　　width:200px;
　　overflow:hidden;
　　text-overflow:ellipsis;
　　display:-webkit-box;//将对象作为弹性伸缩盒子模型显示
　　-webkit-line-clamp:2;//控制显示几行文字
　　-webkit-box-orient:vertical;//设置伸缩盒对象的子元素排列方式
}
如果你标签内的是英文，英文是不会自动换行的，所以你需要让英文自动换行,添加一下代码
word-wrap:break-word;
word-break:break-all;
```


## 9、flex布局

#### 容器属性
 - flex-direction  属性决定主轴的方向（即项目的排列方向）
 - flex-wrap  换行 默认情况下，项目都排在一条线（又称"轴线"）上
 - flex-flow  属性是flex-direction属性和flex-wrap属性的简写形式，默认值为row nowrap
 - justify-content 属性定义了项目在主轴上的对齐方式
    - flex-start（默认值）：左对齐
    - flex-end：右对齐
    - center： 居中
    - space-between：两端对齐，项目之间的间隔都相等。
    - space-around：每个项目两侧的间隔相等。
 - align-items
    - flex-start：交叉轴的起点对齐。
    - flex-end：交叉轴的终点对齐。
    - center：交叉轴的中点对齐。
    - baseline: 项目的第一行文字的基线对齐。
    - stretch（默认值）：如果项目未设置高度或设为auto，将占满整个容器的高度。
 - align-content


#### 项目属性
- order  属性定义项目的排列顺序。数值越小，排列越靠前，默认为0
- flex-grow 属性定义项目的放大比例，默认为0，即如果存在剩余空间，也不放大 
- flex-shrink 属性定义了项目的缩小比例，默认为1，即如果空间不足，该项目将缩小
- flex-basis 属性定义了在分配多余空间之前，项目占据的主轴空间
- flex flex-grow、flex-shrink、flex-basis的简写
- align-self  align-self属性允许单个项目有与其他项目不一样的对齐方式，可覆盖align-items属性
