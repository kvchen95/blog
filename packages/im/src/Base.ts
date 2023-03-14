// import { message } from 'ant-design-vue'

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
