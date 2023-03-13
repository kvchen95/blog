import IM from './Base'
import mitt from 'mitt'
import type { Emitter } from 'mitt'
// import { message } from 'ant-design-vue'

// 前端 IM 监听事件 枚举
const enum SOCKET_EVENTS_FRONTEND {
  CONNECT = 'connect',
  RECONNECT = 'reconnect',
  CONNECT_OTHER_PLACE = 'connect_other_place',
  MESSAGE = 'message',
  HEARTBEAT = 'heartbeat',
  ERROR = 'error',
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
  key: string
  userId: number
  roomId: number
}

// 根据自己公司业务代码扩展 IM
export default class IMCompony extends IM {
  config: IMConfig
  emitter: Emitter<Events>

  constructor(roomId: number, userId: number) {
    super('socketUrl') //

    if (!roomId) throw 'ERR: roomId must be required！'
    if (!userId) throw 'ERR: userId must be required！'
    this.config = {
      key: '', // key
      userId: userId,
      roomId: roomId,
    }
    this.emitter = mitt<Events>()
    this.init()
  }

  addEventListener(event: keyof Events, cb: (params: any) => void) {
    this.emitter.on(event, cb)
    return this
  }

  handleEvent<T = any>(name: keyof Events, data?: T) {
    this.emitter.emit(name, data)
  }

  /** 授权 */
  auth(msg: any) {
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

  sendStopReconnect() {
    this.emitter.emit('reconnect')
  }
  sendHeartbeat() {
    const sendjson = {
      cmd: 'wd_heartbeat',
    }
    this.send(sendjson)
  }
  listen() {
    this.ws!.onopen = (data) => {
      console.log('SUCCESS: ws 连接成功', data)
      clearTimeout(this.reconnectTimer)
      this.reconnectCount = 1
      this.isConnect = true
      this.handleEvent(SOCKET_EVENTS_FRONTEND.CONNECT, data)
    }

    this.ws!.onmessage = <T = any>(data: MessageEvent<T>) => {
      let msg
      try {
        msg = JSON.parse(data.data as string)
      } catch (e) {
        console.error('IM 接收到异常数据: ', e)
        // message.error('IM 接收到异常数据！')
      }
      if (!msg) return

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

    this.ws!.onclose = (data) => {
      this.handleEvent(SOCKET_EVENTS_FRONTEND.CLOSE, data)
    }

    this.ws!.onerror = (data) => {
      this.wsCloseOrError()
      this.handleEvent(SOCKET_EVENTS_FRONTEND.ERROR, data)
    }
  }
}
