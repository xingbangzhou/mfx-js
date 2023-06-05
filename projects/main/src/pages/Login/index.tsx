import {memo} from 'react'
import './index.scss'

const Input = memo(function Input() {
  return <input></input>
})

const Login = memo(function Login() {
  return (
    <div className="login">
      <div className="signWrapper">
        <div className="titleWrapper">
          <h2>Sign in</h2>
          <div>Fill in the fields below to sign into your account.</div>
        </div>
        {/*https://tokyo-nextjs.bloomui.com/auth/login/cover?backTo=%2Fdashboards%2Freports*/}
      </div>
    </div>
  )
})

export default Login
