import {MscxService} from '@mscx/framework'
import {memo, useCallback, useEffect, useRef, useState} from 'react'
import mscxFw from 'src/core/mscxFw'
import styles from './index.module.scss'

interface MaixuProps {
  seatId: number
  name: string
}

const Maixu = memo(function Maixu(props: MaixuProps) {
  const {seatId, name} = props

  return (
    <li>
      <span className={styles.seatId}>{`${seatId + 1}.`}</span>
      <span className={styles.name}>{name}</span>
    </li>
  )
})

const InputLi = memo(function InputHolder(props: {onEnd?: (value?: string) => void}) {
  const {onEnd} = props
  const [active, setActive] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [active])

  const onDoubleClick = () => {
    setActive(true)
  }

  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      onEnd?.(inputRef.current?.value)
      setActive(false)
    }
  }

  return (
    <li className={styles.inputLi} onDoubleClick={onDoubleClick} data-active={active}>
      <input ref={inputRef} onKeyDown={onKeyDown} />
    </li>
  )
})

class MaixuListService extends MscxService {
  constructor() {
    super('MaixuList')

    this.registerInvoke('getItemList', this.getItemList)
  }

  private itemList?: string[]

  getItemList() {
    return this.itemList
  }

  append(value: string) {
    if (!this.itemList) this.itemList = [value]
    else this.itemList.push(value)

    this.emitSignal('itemListChanged', this.itemList)
  }
}

const service = new MaixuListService()

const MaixuList = memo(function MaixuList() {
  const [itemList, setItemList] = useState<string[]>()

  useEffect(() => {
    const fn = (clazz: string, signal: string, l?: string[]) => {
      setItemList(l?.concat())
    }
    setItemList(service.getItemList())

    service.connectSignal('itemListChanged', fn)

    const {ctx: mscxCtx} = mscxFw.instance
    mscxCtx.register(service)

    return () => {
      service.disconnectSignal('itemListChanged', fn)
      mscxCtx.unregister(service)
    }
  }, [])

  const onInputEnd = useCallback((value?: string) => {
    value && service.append(value)
  }, [])

  return (
    <div className={styles.maixuList}>
      <p className={styles.title}>Maixu List</p>
      <ul>
        {itemList?.map((name, i) => (
          <Maixu key={i} seatId={i} name={name} />
        ))}
        <InputLi onEnd={onInputEnd} />
      </ul>
    </div>
  )
})

export default MaixuList
