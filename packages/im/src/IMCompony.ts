import IM from './Base'
import mitt from 'mitt'
import type { Emitter } from 'mitt'
// import { message } from 'ant-design-vue'

// 前端 IM 监听事件 枚举
const enum SOCKET_EVENTS_FRONTEND {
  // 连接成功通知
  CONNECT = 'connect',
  // 重连通知
  RECONNECT = 'reconnect',
  // 异地登录通知
  CONNECT_OTHER_PLACE = 'connect_other_place',
  // 消息通知
  MESSAGE = 'message',
  // 心跳通知
  HEARTBEAT = 'heartbeat',
  // 连接出错通知
  ERROR = 'error',
  // 连接关闭通知
  CLOSE = 'close',
}

// 前端监听事件对应回调参数类型
type Events = {
  connect: any
  reconnect: undefined
  connect_other_place: any
  message: any
  heartbeat: undefined
  close: any
  error: any
}

// 后端定义事件枚举
const enum SOCKET_EVENTS_BACKEND {
  AUTH = 'auth1',
  HEARTBEAT = 'wd_heartbeat',
  CLOSE = 'conn_close',
}

// SOCKET_EVENTS_FRONTEND.CONNECT

interface IMConfig {
  // IM 登录授权 key
  key: string
  // IM 用户 Id
  userId: number
  // IM 房间 Id
  roomId: number
}

// 根据自己公司业务代码扩展 IM 类
export default class IMCompony extends IM {
  // 对应自己公司业务配置信息
  config: IMConfig
  // 发布订阅事件处理
  emitter: Emitter<Events>

  constructor(roomId: number, userId: number) {
    super('socketUrl') // 拿到 socket url

    if (!roomId) throw 'ERR: roomId must be required！'
    if (!userId) throw 'ERR: userId must be required！'
    // 配置相关
    this.config = {
      key: '', // key
      userId: userId,
      roomId: roomId,
    }
    // 初始化发布订阅事件器
    this.emitter = mitt<Events>()
    // socket 初始化
    this.init()
  }

  // 添加外部事件监听
  addEventListener(event: keyof Events, cb: (params: any) => void) {
    this.emitter.on(event, cb)
    return this
  }

  // 触发外部事件监听
  protected handleEvent<T = any>(name: keyof Events, data?: T) {
    this.emitter.emit(name, data)
  }

  /** 授权 */
  protected auth(msg: any) {
    // 看自己公司业务逻辑代码是否有授权逻辑
    // const bm = md5(msg.result.seed + this.config.key)
    const reJson = {
      msg_id: msg.msg_id,
      cmd: 'auth2',
      authCode: '', // bm,
      room_id: `livechat_${this.config.roomId}`,
      userId: this.config.userId,
    }
    this.send(reJson)
    this.isHeartbeat = true
    this.startHeartbeat()
  }

  protected sendStopReconnect() {
    // 通知连接
    this.handleEvent('reconnect')
  }
  // 发送心跳
  protected sendHeartbeat() {
    const sendjson = {
      cmd: 'wd_heartbeat',
    }
    this.send(sendjson)
  }
  // 监听 socket 事件
  protected listen() {
    // socket 连接成功事件
    this.ws!.onopen = (data) => {
      console.log('SUCCESS: ws 连接成功', data)
      clearTimeout(this.reconnectTimer)
      this.reconnectCount = 1
      this.isConnect = true
      this.handleEvent(SOCKET_EVENTS_FRONTEND.CONNECT, data)
    }

    // socket 接收到消息
    this.ws!.onmessage = <T = any>(data: MessageEvent<T>) => {
      let msg
      try {
        msg = JSON.parse(data.data as string)
      } catch (e) {
        console.error('IM 接收到异常数据: ', e)
        // message.error('IM 接收到异常数据！')
      }
      if (!msg) return
      // 根据自己公司业务逻辑处理对应事件通知
      if (msg.cmd === SOCKET_EVENTS_BACKEND.AUTH) {
        this.auth(msg)
      } else if (msg.cmd === SOCKET_EVENTS_BACKEND.HEARTBEAT) {
        this.isHeartbeat = true
        this.handleEvent(SOCKET_EVENTS_FRONTEND.HEARTBEAT)
      } else if (msg.cmd === SOCKET_EVENTS_BACKEND.CLOSE) {
        this.handleEvent(SOCKET_EVENTS_FRONTEND.CONNECT_OTHER_PLACE, msg)
        this.closeIm()
      } else {
        if (msg.result?.message)
          this.handleEvent(SOCKET_EVENTS_FRONTEND.MESSAGE, msg.result)
      }
    }

    // socket 关闭事件
    this.ws!.onclose = (data) => {
      this.handleEvent(SOCKET_EVENTS_FRONTEND.CLOSE, data)
    }
    // socket 出错事件
    this.ws!.onerror = (data) => {
      this.wsCloseOrError()
      this.handleEvent(SOCKET_EVENTS_FRONTEND.ERROR, data)
    }
  }
}
