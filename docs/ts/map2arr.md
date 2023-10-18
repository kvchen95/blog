# 如何优雅的渲染一个表单页面

我们在前端开发中不可避免的会遇到表单页面，在表单提交中经常会遇到各种问题



```typescript
function map2Arr<K, V, R>
(
    map:  Map<K, V>,
    Fn?: (item: [K, V]) => R
) {
    if (Fn) {
        return Array.from(map, Fn)
    }
    return Array.from(map, (item) => ({title: item[1], value: item[0]}))
}
```