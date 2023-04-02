# 不再是你以为的 for in 和 for of 有什么区别

## 简介
经常看到有人问 `for in` 和 `for of` 的区别，基本网上去搜几篇文章也都能窥探一二，
但是当我真正使用下来，发现里面其实还是有很多问题，比如：

- 为什么有了 `for` 循环，还会有 `for in` 和 `for of` ？
- 为什么 `for in` 和 `for of` 都能遍历数组？
- 为什么 `for of` 不能遍历对象

当我尝试去把这些问题一一解开的时候，发现事情并不是那么简单。下面进入正题。

## for in 和 for of 基本介绍

要了解 `for in` 和 `for of`，我们需要先看看 `for in` 和 `for of` 的历史，`for in` 在 `js` 第一个版本就实现了，和 `for` 循环是一起出现的；而 `for of` 的出现是在 js 大更新的 ES6 时期。
需要说明的是早期 js 还没有现在这么复杂，对象和数组已经能完全满足我们的开发，所以早期将for 循环用于遍历数组，而 for in 用于遍历对象。各司其职，就已经足够了。
而 `for of` 是在 ES6 在新增的，与 for of 同时出现的还有 Map Set 这些新的数据存储结构，已有的 for 循环显然满足不了各种新结构的遍历功能，for of 的出现弥补了新的数据结构的遍历功能缺失。

### for in 的基本使用

当我们拥有一个对象的时候，我们有时候需要知道这个对象有哪些属性，或者统计对象的属性个数的时候就可以使用 for in。

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

## for in 和 for of 的差异

















for in 和 for of 能混用吗？
```typescript
const map = { a: 'string', b: 1, c: false }

for (const key in map) {
  console.log(key)
}
// 0
// 1
// 2
```
可以看到 for in 也是可以遍历数组的，key 对应数组的下标。那么 for of 能用来遍历对象吗？

```typescript
const obj = { a: 'string', b: 1, c: false }

for (const val of obj) {
  console.log(val)
}
// ERROR: Uncaught TypeError: obj is not iterable at <anonymous>:3:19
```
`for of` 用来遍历对象报错了，说了对象不可迭代。为什么会这样呢？

这里就需要贴一下 MDN 了：`for...of` 语句在 **可迭代对象**（包括 `Array`，`Map`，`Set`，`String`，`TypedArray`，`arguments` 对象等等）上创建一个迭代循环，
调用自定义迭代钩子，并为每个不同属性的值执行语句。

重点是 可迭代对象 这 5 个字，基于这句我们就知道了 `for of` 只能遍历可迭代对象。那么什么是可迭代对象？可迭代对象其实就是一个提供了迭代器的对象。迭代器又是个什么啊？

## 迭代器是个啥

迭代器其实是一个行为型的设计模式，这个设计模式的核心思想就是旨在不暴露数据结构的情况下能够遍历集合中的所有元素。由于迭代器模式实现太重要了，
所有语言基本都提供了迭代器功能，所以即使你一直在使用它，但你可能没注意到过它。

其实迭代器实现也很简单，下面实现最简单的迭代器去遍历数组。
```typescript
function makeIteration (arr) {
  let index = 0
  return {
    next(){
      if (index < arr.length) {
        return {
          value: arr[index++],
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

const rangeIterator = makeIteration([0, 1, 2])
console.log(rangeIterator.next()) // {value: 0, done: false}
console.log(rangeIterator.next()) // {value: 1, done: false}
console.log(rangeIterator.next()) // {value: 2, done: false}
console.log(rangeIterator.next()) // {value: undefined, done: true}
```

既然对象是因为没有迭代器，那我门自己给它实现一个吧。

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

// 完美！
```



我们可以得出结论，`for in` 遍历的是对象的属性，而 `for of` 遍历的是迭代器。






