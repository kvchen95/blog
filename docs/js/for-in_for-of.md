# 为了搞清楚 for in 和 for of 的区别，我刨了它的祖坟

## 目录

- for in 和 for of 基本介绍
- for in 和 for of 的差异
- 迭代器是个啥
- 还记得当年的 yield 吗
- promise 与 迭代器



## for in 和 for of 基本介绍

这里就不贴 `MDN` 的机器人定义了，其实说明白 `for in` 很简单，我们学 `js` 的时候就学了 `for` 循环，那你能用 `for` 循环去遍历一个对象吗？显然不能，所以自然就有了 `for in` 的出现。说白了 `for in` 的出现就是为了解决无法遍历对象属性的问题，当我们拥有一个对象的时候，我们有时候需要知道这个对象有哪些属性，或者统计对象的属性个数的时候就可以使用它。

```javascript
const obj = { a: 'string', b: 1, c: false }
for (const key in obj) {
  console.log(key, obj[key])
}
// a string
// b 1
// c false
```

而 `for of` 是个啥呢？我们知道 `ES6` 迎来了重大改革，新增了 `Map` 和 `Set` 标准内置对象。但是如果用户想要遍历 `Map` 和 `Set` 呢？用 `for` 循环吗，它是用于遍历数组的，那 `for in` 可以吗？不好意思，不支持。那怎么办呢？这样吧，再给你实现一个 `for of`，完美解决。

```javascript
const map = new Map([['a', 'string'], ['b', 1], ['c', false]])

for (const key in map) {
  console.log(key)
}

for (const [key, value] of map) {
  console.log(key, value)
}
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

这里就需要贴一下 MDN 了：`for...of` 语句在 **可迭代对象**（包括 `Array`，`Map`，`Set`，`String`，`TypedArray`，`arguments` 对象等等）上创建一个迭代循环，调用自定义迭代钩子，并为每个不同属性的值执行语句。

重点是 可迭代对象 这5个字，基于这句我们就知道了 `for of` 只能遍历可迭代对象。那么什么是可迭代对象呢？
可迭代对象就是符合 可迭代协议 和 迭代器协议 的对象。

可迭代协议规定对象必须实现 `@@iterator` 方法（可通过常量 `Symbol.iterator` 访问该属性）。

迭代器协议规定


## 迭代器是个啥

**迭代器模式** 其实是一种行为设计模式，它能让你在不暴露集合底层表现形式 （列表、 栈和树等） 的情况下遍历集合中所有的元素。
基于这点我们就知道了，不管是数组还是 Map，只要这个数据结构能够