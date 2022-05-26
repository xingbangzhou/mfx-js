import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import useEnhancedEffect from 'src/hooks/useEnhancedEffect'

interface DescendantProps {
  element?: HTMLElement | null
  id?: string
  [key: string]: any
}

type DescendantItem = DescendantProps & {index: number}

const noop = () => {}

const DescendantContext = createContext<{
  descendants: DescendantItem[]
  registerDescendant: (descent: DescendantProps) => void
  unregisterDescendant: (element: HTMLElement) => void
  parentId?: string
}>({descendants: [], registerDescendant: noop, unregisterDescendant: noop, parentId: undefined})

function findIndex(array: DescendantItem[], comp: (value: DescendantItem) => boolean) {
  for (let i = 0; i < array.length; i += 1) {
    if (comp(array[i])) {
      return i
    }
  }

  return -1
}

function binaryFindElement(array: DescendantItem[], element: HTMLElement) {
  let start = 0
  let end = array.length - 1

  while (start <= end) {
    const middle = Math.floor((start + end) / 2)

    if (array[middle].element === element) {
      return middle
    }

    // eslint-disable-next-line no-bitwise
    if (array[middle].element!.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING) {
      end = middle - 1
    } else {
      start = middle + 1
    }
  }

  return start
}

function usePrevious<T = unknown>(value: T) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export function useDescendant(descendant: DescendantProps) {
  const [, forceUpdate] = useState<any>()
  const {
    registerDescendant = noop,
    unregisterDescendant = noop,
    descendants = [],
    parentId = null, // parentId 默认为 null
  } = useContext(DescendantContext)

  const index = findIndex(descendants, item => item.element === descendant.element)

  const previousDescendants = usePrevious(descendants)

  const someDescendantsHaveChanged = descendants.some((newDescendant: DescendantItem, position: number) => {
    return (
      previousDescendants &&
      previousDescendants[position] &&
      previousDescendants[position].element !== newDescendant.element
    )
  })

  useEnhancedEffect(() => {
    if (descendant.element) {
      const {element} = descendant
      registerDescendant({
        ...descendant,
        index,
      })
      return () => {
        unregisterDescendant(element)
      }
    }
    forceUpdate({})

    return undefined
  }, [registerDescendant, unregisterDescendant, index, someDescendantsHaveChanged, descendant])

  return {parentId, index}
}

export function DescendantProvider(props: {children?: ReactNode; id?: string}) {
  const {children, id} = props

  const [items, set] = useState<DescendantItem[]>([])

  const registerDescendant = useCallback(({element, ...other}: DescendantProps) => {
    set(oldItems => {
      if (oldItems.length === 0) {
        return [
          {
            ...other,
            element,
            index: 0,
          },
        ]
      }

      let newItems: DescendantItem[] = []

      const index = binaryFindElement(oldItems, element!)
      if (oldItems[index] && oldItems[index].element === element) {
        newItems = oldItems
      } else {
        const newItem = {
          ...other,
          element,
          index,
        }
        newItems = oldItems.slice()
        newItems.splice(index, 0, newItem)
      }

      newItems.forEach((item, position) => {
        item.index = position
      })

      return newItems
    })
  }, [])

  const unregisterDescendant = useCallback((element: HTMLElement) => {
    set(oldItems => oldItems.filter(item => element !== item.element))
  }, [])

  const value = useMemo(
    () => ({
      descendants: items,
      registerDescendant,
      unregisterDescendant,
      parentId: id,
    }),
    [items, registerDescendant, unregisterDescendant, id],
  )

  return <DescendantContext.Provider value={value}>{children}</DescendantContext.Provider>
}
