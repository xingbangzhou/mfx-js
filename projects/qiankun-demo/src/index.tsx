import ReactDOM from 'react-dom'
import mfx from './mfx'
import App from './pages/App'

function render(props: any) {
  const {container} = props
  ReactDOM.render(<App />, (container || document).querySelector('#root'))
}

if (!window['__POWERED_BY_QIANKUN__']) {
  render({})
}

export async function bootstrap(props?: any) {
  mfx.active(props?.ctx)
}

export async function mount(props: any) {
  render(props)
}

export async function unmount(props: any) {
  const {container} = props
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'))
}

export async function update(props: any) {}
