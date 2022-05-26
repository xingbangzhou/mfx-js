import {useEffect, useState} from 'react'

export default function useReactId(idOverride?: string): string | undefined {
  const [defaultId, setDefaultId] = useState(idOverride)
  const id = idOverride || defaultId

  useEffect(() => {
    if (defaultId == null) {
      setDefaultId(`tree-${Math.round(Math.random() * 1e9)}`)
    }
  }, [defaultId])

  return id
}
