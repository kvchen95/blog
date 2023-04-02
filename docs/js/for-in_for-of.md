# 透过 for in 和 for of 的区别，你看到了什么

## 简介
经常看到有人问 `for in` 和 `for of` 的区别，基本网上去搜几篇文章也都能窥探一二，
但是当我真正使用下来，发现里面其实还是有很多问题，比如：

- 为什么有了 `for` 循环，还会有 `for in` 和 `for of` ？
- 为什么 `for in` 和 `for of` 都能遍历数组？
- 为什么 `for of` 不能遍历对象

当我尝试去把这些问题一一解开的时候，发现事情并不是那么简单。下面进入正题。

## for in 和 for of 基本介绍

要了解 `for in` 和 `for of`，我们需要先看看 `for in` 和 `for of` 的历史，`for in` 在 `js` 第一个版本就实现了，和 `for` 循环是一起出现的；
而 `for of` 的出现是在 `js` 大更新的 `ES6` 时期。
需要说明的是早期 `js` 还没有现在这么复杂，对象和数组已经能完全满足我们的开发，所以早期将 `for` 循环用于遍历数组，而 `for in` 用于遍历对象。
各司其职，就已经足够了。
而 `for of` 是在 `ES6` 在新增的，与 `for of` 同时出现的还有 `Map`、 `Set` 这些新的数据存储结构，
已有的 `for` 循环显然满足不了各种新结构的遍历功能，而 `for of` 的出现弥补了新的数据结构的遍历功能缺失。

### for in 的基本使用

当我们拥有一个对象的时候，我们有时候需要知道这个对象有哪些属性，或者统计对象的属性个数的时候就可以使用 `for in`。

```javascript
// for in 遍历一个对象
const obj = { a: 'string', b: 1, c: false }
for (const key in obj) {
  console.log(key, obj[key])
}
// 结果如下：
// a string
// b 1
// c false
```

### for of 的基本使用

```javascript
// for of 遍历一个 Map
const map = new Map([['a', 'string'], ['b', 1], ['c', false]])

for (const [key, value] of map) {
  console.log(key, value)
}
// 结果如下：
// a string
// b 1
// c false
```

## 为什么 for in 能够遍历数组？

前面我们提到了 `for in` 是用来遍历对象的，那为什么 `for in` 也能遍历数组呢？
这里其实就不得不提一嘴了，`js` 的数组结构其实不是真正的数组结构，
这个其实不难发现，你打开任何一个介绍数据结构的书籍里面都会提到，数组是一个连续的存储空间。
所以数组的长度一定是固定的，而且必须存储统一类型的数据。而 `js` 的数组其实是基于对象封装的，
所以你可以理解为在 `js` 里，数组就是一个实现了数组方法的对象。所以 `for in` 能遍历数组就一点也不奇怪了。

## 为什么 for of 不能遍历对象

在开头就讲到了，`ES6` 新增了新的数据结构，比如 `Map`，而且考虑到 `js` 的火热，那么很有可能还会有更多的数据结构出现，
早期只有对象和数组，`for` 循环和 `for in` 也不是那么难理解，但是考虑到后续的拓展性，我们需要一种新的迭代方法，
它最好能够支持所有数据结构的遍历。听起来有点困难，但其实这是一个很简单的事情，设计模式里面就提到了我们的迭代器模式，
迭代器模式的核心思想就是旨在不暴露数据结构的情况下能够遍历集合中的所有元素。
只不过由于迭代器模式是在是太重要了，所以你可能都注意不到它。大家在看 `for of` 的使用介绍中，
都会看到这么一句话，`for of` 只能用来遍历可迭代对象。这句话就说明了 `for of` 遍历的其实不是我们的数据结构，而是数据结构提供的迭代器。
那么 `js` 中哪些数据结构提供了迭代器呢？根据 `MDN` 的数据，
已知的有`Array`，`Map`，`Set`，`String`，`TypedArray`，`arguments` 等，就是不包含对象。

### 给对象实现个迭代器

刚刚说了 `for of` 遍历的是数据结构提供的迭代器，既然对象没有，那我们尝试实现一个看看：

```javascript
// 给对象添加迭代器
Object.prototype[Symbol.iterator] = function() {
  const values = Object.values(this)
  let index = 0
  return {
    next() {
      if (index < values.length) {
        return {
          value: values[index++],
          done: false
        }
      }
      return {
        value: undefined,
        done: true
      }
    }
  }
}

const obj = { a: 'string', b: 1, c: false }
// 测试一下
for (const val of obj) {
  console.log(val)
}
// string
// 1
// false

// 完美运行！
```
## 结束

快乐的时间总是短暂，这片文章到这里就结束了。但是以后再有人问你 `for in` 和 `for of` 的区别，我可不允许你不知道了啊！

> 附上 github，欢迎👏 star✨：[https://github.com/coveychen95/blog](https://github.com/coveychen95/blog)