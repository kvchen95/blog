# 一个通用的 WebSocket 该长什么样子

## 怎么样封装📦更好？

- **简单易用**  

 对于一个使用者来说，我并不关心你底层的逻辑，你是如何处理连接以及心跳💗这些都是不值得关注的，甚至不 care 你是否使用的 WebSocket 。
 对于使用者来说，他只关注你能不能实现我信息的实时通知。

- **灵活扩展**
 
 在我实际开发的过程中，遇到的问题是这个 IM 因为价格原因，可能会切换不同供应商。所以我们需要保证 业务逻辑 和 核心逻辑 不能耦合。

## Show me the code.

基于以上两点，先封装一个 IM 基类，基类只处理 socket 相关核心逻辑。可基于基类扩展相应业务类，这样就能实现实时切换了。  
废话少说，直接上代码了：
```typescript
// 基类
export default abstract class IM {
  // 心跳 timer
  heartbeatTimer: NodeJS.Timeout | undefined
  // 是否设置心跳
  isHeartbeat: boolean
  // ws 是否连接上
  isConnect: boolean
  // 是否重连
  isReconnect: boolean
  // 重连 timer
  reconnectTimer: NodeJS.Timeout | undefined
  // 重连次数
  reconnectCount: number
  // 长连接实例
  ws: WebSocket | null
  // 是否出错断连
  isCloseByError: boolean
  // 重连最大次数
  readonly reconnectMaxTimes: number
  // 心跳时间
  readonly heartbeatSecond: number
  // 长连接地址
  private url: string

  constructor(url: string) {
    this.reconnectMaxTimes = 3
    this.heartbeatSecond = 2000
    this.heartbeatTimer = undefined
    this.isHeartbeat = false
    this.isReconnect = false
    this.reconnectTimer = undefined
    this.isConnect = false
    this.reconnectCount = 0
    this.ws = null
    this.isCloseByError = false
    this.url = url
  }
  init(): void {
    this.stop()
    this.connect()
    this.listen()
  }
  // 停止当前
  stop() {
    this.heartbeatTimer = undefined
    this.isHeartbeat = false
    this.isConnect = false
    this.isReconnect = false
    if (this.ws) {
      this.ws.close()
    }
    this.ws = null
  }
  // 连接 socket
  connect() {
    this.ws = new WebSocket(this.url)
  }
  // 断开连接
  closeIm() {
    this.isReconnect = false
    if (this.ws) {
      this.ws.close()
    }
  }

  // 监听 socket
  protected abstract listen(): void

  protected wsCloseOrError() {
    if (this.isCloseByError) {
      return
    }
    this.isCloseByError = true
    setTimeout(() => {
      // 防止同一时刻close和error多次调用
      this.isCloseByError = false
    }, 500)
    this.isConnect = true
    this.reconSocketFn()
  }

  protected reconSocketFn() {
    console.log('重连')
    clearTimeout(this.reconnectTimer)
    if (!this.isReconnect || this.reconnectCount > this.reconnectMaxTimes) {
      console.log('关闭链接不再重连了')
      this.sendStopReconnect()
      return
    }
    this.init()
    this.reconnectCount++
    this.reconnectTimer = setTimeout(() => {
      this.reconSocketFn()
    }, 5000)
  }
  // 发送消息不再重连
  protected abstract sendStopReconnect(): void
  // 发送心跳消息
  protected abstract sendHeartbeat(): void
  // 发送消息
  protected send(msg: any) {
    if (this.isConnect) {
      this.ws!.send(JSON.stringify(msg))
    } else {
      // message.error('socket 未连接，无法发送消息！')
    }
  }
  // 开始心跳
  protected startHeartbeat() {
    clearTimeout(this.heartbeatTimer)
    if (!this.isHeartbeat) {
      return
    }
    this.isHeartbeat = false
    this.sendHeartbeat()
    this.heartbeatTimer = setTimeout(() => {
      this.startHeartbeat()
    }, this.heartbeatSecond)
  }
}

```

以及基于基类扩展的业务类：

```typescript
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
```

以及使用的 demo：

```typescript
import IMCompony from './IMCompony'

const imCompony = new IMCompony(1, 9527)
  .addEventListener('message', (data) => {
    console.log('data: ', data)
  })
  .addEventListener('heartbeat', () => {
    console.log('heartbeat: ')
  })
console.log('imCompony: ', imCompony)

```

so easy!

> 源码地址 [github.com/coveychen95](https://github.com/coveychen95/blog/tree/master/packages/im/src)