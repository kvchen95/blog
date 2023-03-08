import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

type BaseApiResponse<T> = {
  code: number
  message: string
  result: T
}

// 导出Request类，可以用来自定义传递配置来创建实例
export default class Request {
  // axios 实例
  private _instance: AxiosInstance
  // 基础配置，url和超时时间
  private _defaultConfig: AxiosRequestConfig = {
    baseURL: '/api',
    timeout: 5000,
  }
  // 拦截器配置
  private _interceptorHooks: any

  constructor(config: AxiosRequestConfig) {
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
      (err: any) => {
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
        // 这里用来处理http常见错误，进行全局提示
        const mapErrorStatus = new Map([
          [400, '请求方式错误'],
          [401, '请重新登录'],
          [403, '拒绝访问'],
          [404, '请求地址有误'],
          [500, '服务器出错'],
        ])
        let message = mapErrorStatus.get(err.response.status) || '请求出错，请稍后再试'
        // 此处全局报错
        console.error(message);
        return Promise.reject(err.response)
      }
    )
  }

  // 定义核心请求
  public request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    // ！！！⚠️ 注意：axios 已经将请求使用 promise 封装过了
    // 这里直接返回，不需要我们再使用 promise 封装一层
    return this._instance.request(config)
  }

  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.get(url, config)
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.post(url, data, config)
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.put(url, data, config)
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<BaseApiResponse<T>>> {
    return this._instance.delete(url, config)
  }
}
