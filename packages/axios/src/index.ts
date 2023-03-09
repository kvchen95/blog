import Request from './Request'
import { transform } from './interceptorHooks'

// 具体使用时先实例一个请求对象
const request = new Request({
  baseURL: '/api',
  timeout: 5000,
  interceptorHooks: transform,
})

export default request

interface ResModel {
  str: string
  num: number
}
// 发起请求
request
  .post<ResModel>(
    '/abc',
    {
      a: 'aa',
      b: 'bb',
    },
    {
      requestOptions: {
        globalErrorMessage: true,
      },
    }
  )
  .then((res) => {
    console.log('res: ', res)
    console.log(res.str)
  })
