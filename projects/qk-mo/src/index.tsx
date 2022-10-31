import ReactDOM from 'react-dom'
import activator from './activator'
import App from './pages/App'

export async function bootstrap() {
  console.log('qiankun bootstrap')
}

export async function mount(props: any) {
  console.log('qiankun mount')
  ReactDOM.render(<App></App>, props.container)
}

export async function unmount(props: any) {
  console.log('qiankun unmount')
  ReactDOM.unmountComponentAtNode(props.container)
}

export async function update(props: any) {
  console.log('qiankun update props', props)
  activator.active(props.ctx)
}
