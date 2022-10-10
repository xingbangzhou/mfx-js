import {useCallback, useEffect, useRef, useState} from 'react'

interface UseControlledProps<T = unknown> {
  controlled: T
  default: T
  name: string
  state?: string
}

export default function useControlled<T = unknown>({
  controlled,
  default: defaultProp,
  name,
  state = 'value',
}: UseControlledProps<T>): [T, (newValue: T | ((prevValue: T) => T)) => void] {
  const {current: isControlled} = useRef(controlled)
  const [valueState, setValue] = useState(defaultProp)
  const value = isControlled ? controlled : valueState

  const {current: defaultValue} = useRef(defaultProp)

  useEffect(() => {
    if (!isControlled && defaultValue !== defaultProp) {
      console.error(
        [
          `A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. ` +
            `To suppress this warning opt to use a controlled ${name}.`,
        ].join('\n'),
      )
    }
  }, [JSON.stringify(defaultProp)])

  const setValueIfUncontrolled = useCallback((newValue: T | ((prevValue: T) => T)) => {
    if (!isControlled) {
      setValue(newValue)
    }
  }, [])

  return [value, setValueIfUncontrolled]
}
