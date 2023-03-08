import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// 定义一个常见后端请求返回
type BaseApiResponse<T> = {
  code: number
  message: string
  result: T
}
// 拓展 axios 请求配置，加入我们自己的配置
interface RequestOptions {
  // 是否全局展示请求 错误信息
  globalErrorMessage: boolean
  // 是否全局展示请求 成功信息
  globalSuccessMessage: boolean
}

// 拓展请求配置
interface ExpandInternalAxiosRequestConfig<D= any> extends InternalAxiosRequestConfig<D> {
  requestOptions: RequestOptions
}

// 拓展请求配置
interface ExpandRequestConfig<D = any> extends AxiosRequestConfig<D> {
  requestOptions: RequestOptions
}

// 拓展请求返回配置
interface ExpandAxiosResponse<T = any, D = any> extends AxiosResponse<T, D> {
  config: ExpandInternalAxiosRequestConfig<D>
}

// 导出Request类，可以用来自定义传递配置来创建实例
export default class Request {
  // axios 实例
  private _instance: AxiosInstance
  // 默认配置
  private _defaultConfig: ExpandRequestConfig = {
    baseURL: '/api',
    timeout: 5000,
    requestOptions: {
      globalErrorMessage: true,
      globalSuccessMessage: false,
    },
  }
  // TODO:
  // 拦截器配置
  private _interceptorHooks: any

  constructor(config: ExpandRequestConfig) {
    // 使用axios.create创建axios实例
    this._instance = axios.create(Object.assign(this._defaultConfig, config))

    this._instance.interceptors.request.use(
      (config) => {
        // 请求头部处理，如添加 token
        const token = 'token-value'
        if (token) {
          config.headers.Authorization = token
        }
        return config
      },
      <T = any>(
        err: ExpandAxiosResponse<BaseApiResponse<T>, ExpandRequestConfig>
      ) => {
        console.log('err: ', err)
        err.config.requestOptions.globalErrorMessage
        // 请求错误，这里可以用全局提示框进行提示
        return Promise.reject(err)
      }
    )

    this._instance.interceptors.response.use(
      (res: AxiosResponse) => {
        // 请求返回值，建议将 返回值 进行解构
        return res.data
      },
      (err: any) => {
        // 这里用来处理 http 常见错误，进行全局提示
        const mapErrorStatus = new Map([
          [400, '请求方式错误'],
          [401, '请重新登录'],
          [403, '拒绝访问'],
          [404, '请求地址有误'],
          [500, '服务器出错'],
        ])
        let message =
          mapErrorStatus.get(err.response.status) || '请求出错，请稍后再试'
        // 此处全局报错
        console.error(message)
        return Promise.reject(err.response)
      }
    )
  }

  // 定义核心请求
  public request(config: ExpandRequestConfig): Promise<AxiosResponse> {
    // ！！！⚠️ 注意：axios 已经将请求使用 promise 封装过了
    // 这里直接返回，不需要我们再使用 promise 封装一层
    return this._instance.request(config)
  }

  public get<T = any>(
    url: string,
    config?: ExpandRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.get(url, config)
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: ExpandRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.post(url, data, config)
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: ExpandRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.put(url, data, config)
  }

  public delete<T = any>(
    url: string,
    config?: ExpandRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.delete(url, config)
  }
}
