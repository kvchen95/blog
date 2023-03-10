import { InterceptorHooks, ExpandAxiosResponse } from './types'

export const transform: InterceptorHooks = {
  requestInterceptor(config) {
    // 请求头部处理，如添加 token
    const token = 'token-value'
    if (token) {
      config!.headers!.Authorization = token
    }
    return config
  },
  requestInterceptorCatch(err) {
    // 请求错误，这里可以用全局提示框进行提示
    return Promise.reject(err)
  },
  responseInterceptor(result) {
    // 因为 axios 返回不支持扩展自定义配置，需要自己断言一下
    const res = result as ExpandAxiosResponse
    // 与后端约定的请求成功码
    const SUCCESS_CODE = 1
    if (res.status !== 200) return Promise.reject(res)
    if (res.data.code !== SUCCESS_CODE) {
      if (res.config.requestOptions?.globalErrorMessage) {
        // 这里全局提示错误
        console.error(res.data.message)
      }
      return Promise.reject(res.data)
    }
    if (res.config.requestOptions?.globalSuccessMessage) {
      // 这里全局提示请求成功
      console.log(res.data.message)
    }
    // 请求返回值，建议将 返回值 进行解构
    return res.data.result
  },
  responseInterceptorCatch(err) {
    // 这里用来处理 http 常见错误，进行全局提示
    const mapErrorStatus = new Map([
      [400, '请求方式错误'],
      [401, '请重新登录'],
      [403, '拒绝访问'],
      [404, '请求地址有误'],
      [500, '服务器出错'],
    ])
    const message =
      mapErrorStatus.get(err.response.status) || '请求出错，请稍后再试'
    // 此处全局报错
    console.error(message)
    return Promise.reject(err.response)
  },
}
