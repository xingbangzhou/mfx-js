interface InvokeResolveFn {
  (result: any): void
}

interface InvokeRejectFn {
  (reason: any): void
}

export default class InvokePool {
  constructor(overMs = 5000) {
    this.overMs = overMs
    this.lastTime = new Date().getTime()
    this.lastIdx = 0
  }

  private overMs: number
  private overTimerId?: number
  private lastTime: number
  private lastIdx: number
  private blockExecs?: Record<string, [number, InvokeResolveFn, InvokeRejectFn]>

  invoke() {
    const id = this.getInvokeId()
    const result = new Promise((resolve, reject) => {
      if (!this.blockExecs) this.blockExecs = {}
      this.blockExecs[id] = [new Date().getTime(), resolve, reject]
      if (!this.overTimerId) {
        this.overTimerId = window.setInterval(this.onTimeover, this.overMs)
      }
    })

    return {id, result}
  }

  resolve(id: string, result: any) {
    const exec = this.blockExecs?.[id]
    if (!exec) return

    exec[1](result)
    delete this.blockExecs?.[id]
  }

  private getInvokeId() {
    const curTime = new Date().getTime()
    if (curTime !== this.lastTime) {
      this.lastTime = curTime
      this.lastIdx = 0
    } else {
      this.lastIdx++
    }
    return `${this.lastTime}#${this.lastIdx}`
  }

  private onTimeover = () => {
    const curTime = new Date().getTime()
    let count = 0
    for (const id in this.blockExecs) {
      count++
      const inv = this.blockExecs[id]
      if (curTime - inv[0] < this.overMs) continue
      inv[2]({id: id, message: 'Error: Invoke over time.'})
      delete this.blockExecs[id]
      count--
    }
    if (!count) {
      window.clearInterval(this.overTimerId)
      this.overTimerId = undefined
    }
  }
}
