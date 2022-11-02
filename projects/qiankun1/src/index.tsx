import ReactDOM from 'react-dom'
import activator from './activator'
import App from './pages/App'

function render(props: any) {
  const {container} = props
  ReactDOM.render(<App />, container ? container.querySelector('#mco-root') : document.querySelector('#root'))
}

if (!window['__POWERED_BY_QIANKUN__']) {
  render({})
}

export async function bootstrap(props?: any) {
  activator.active(props?.ctx)
  console.log('qiankun bootstrap', props)
}

export async function mount(props: any) {
  console.log('qiankun mount', props)
  render(props)
}

export async function unmount(props: any) {
  console.log('qiankun unmount', props)
  const {container} = props
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#mco-root') : document.querySelector('#root'))
}

export async function update(props: any) {
  console.log('qiankun update props', props)
}
