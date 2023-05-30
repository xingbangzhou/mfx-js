export interface MxLauncherOption {
  debug?: boolean
}

export class MxDestructor {
  private _cleanFns?: Array<() => void>

  push(fn: () => void) {
    if (!this._cleanFns) this._cleanFns = [fn]
    else if (this._cleanFns.includes(fn)) {
      this._cleanFns.push(fn)
    }
  }

  destruct() {
    this._cleanFns?.forEach(el => el())
    this._cleanFns = undefined
  }
}
