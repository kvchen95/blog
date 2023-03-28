# 为了搞清楚 for in 和 for of 的区别，我把它祖宗十八代都问候了一遍

## 目录

- for in 和 for of 基本介绍
- for in 和 for of 的差异
- 迭代器是个啥
- 还记得当年的 yield 吗
- promise 与 迭代器



## for in 和 for of 基本介绍

这里就不贴 `mdn` 的机器人解释了，其实说明白 for in 很简单，我们学 js 的时候就学了 for 循环，那你能用 for 循环去遍历一个对象吗？显然不能，所以自然就有了 for in 的出现。说白了 `for in` 的出现就是为了解决无法遍历对象属性的问题，当我们拥有一个对象的时候，我们有时候需要知道这个对象有哪些属性，或者统计对象的属性个数的时候就可以使用它。

```javascript
const obj = { a: 'string', b: 1, c: false }
for (const key in obj) {
  console.log(key, obj[key])
}
// a string
// b 1
// c false
```

而 for of 是个啥呢？我们知道 ES6 迎来了重大改革，新增了 Map 和 Set 标准内置对象。但是如果用户想要遍历 Map 和 Set 呢？用 for 循环吗，它是用于遍历数组的，那 for in 可以吗？不好意思，不支持。那怎么办呢？这样吧，再给你实现一个 for of ，这回满意了吧。

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
