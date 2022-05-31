import {memo, useEffect, useMemo, useState} from 'react'
import {bizCenter} from 'src/modules'

type TReactComponent<P = any> =
  | React.ClassicComponentClass<P>
  | React.ComponentClass<P>
  | React.FunctionComponent<P>
  | React.ForwardRefExoticComponent<P>

const MainArea = memo(function MainArea() {
  const [component, setComponent] = useState<TReactComponent>()

  useEffect(() => {
    const fn = (id?: string) => {
      const item = bizCenter.getItem(id)
      setComponent(item?.component)
    }
    fn(bizCenter.activedId)

    bizCenter.addListener('activedChanged', fn)

    return () => {
      bizCenter.removeListener('activedChanged', fn)
    }
  }, [])

  const Content = useMemo(() => {
    if (!component) return undefined
    const Component = component as any
    return <Component />
  }, [component])

  return <div className="mainArea">{Content}</div>
})

export default MainArea
