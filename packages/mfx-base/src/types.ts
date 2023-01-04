export interface MfxLinkHandler {
  (on: boolean, cl: string): void
}

export interface MfxInvokableHandler {
  (...args: any[]): any
}

export interface MfxSignalHandler {
  (...args: any[]): void
}

export interface MfxEventListener {
  (...args: any[]): void
}
