interface InvokeResolveFn {
  (result: any): void
}

interface InvokeRejectFn {
  (reason: any): void
}

interface BlockExecProps {
  resolve: InvokeResolveFn
  reject: InvokeRejectFn
  time: number
  args: any[]
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
  private blockExecs?: Record<string, BlockExecProps>

  invoke(...args: any[]) {
    const id = this.getInvokeId()
    const result = new Promise<any>((resolve, reject) => {
      if (!this.blockExecs) this.blockExecs = {}
      this.blockExecs[id] = {resolve, reject, time: new Date().getTime(), args}
      if (!this.overTimerId) {
        this.overTimerId = window.setInterval(this.onTimeover, this.overMs)
      }
    })

    return {id, result}
  }

  resolve(id: string, result: any) {
    const exec = this.blockExecs?.[id]
    if (!exec) return

    exec.resolve(result)
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
      const exec = this.blockExecs[id]
      if (curTime - exec.time < this.overMs) continue
      exec.reject({id: id, message: 'Invoke overtime!', args: exec.args})
      delete this.blockExecs[id]
      count--
    }
    if (!count) {
      window.clearInterval(this.overTimerId)
      this.overTimerId = undefined
    }
  }
}
