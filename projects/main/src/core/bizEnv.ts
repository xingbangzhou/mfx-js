import {EventService, invokable} from '@mfx-js/core'

class BizEnv extends EventService {
  constructor() {
    super('BizEnv')
  }

  @invokable
  getEnvInfo() {
    return {
      version: '1.0.0',
      mode: 'dev',
    }
  }
}

const bizEnv = new BizEnv()

export default bizEnv
