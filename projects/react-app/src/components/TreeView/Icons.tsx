import {HTMLAttributes, memo} from 'react'

export const DefaultExpandIcon = memo(function DefaultCollapseIcon(props: HTMLAttributes<HTMLOrSVGElement>) {
  const {className, ...other} = props
  return (
    <svg className={className} focusable="false" aria-hidden="true" viewBox="0 0 24 24" {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"></path>
      </svg>
    </svg>
  )
})

export const DefaultCollapseIcon = memo(function DefaultCollapseIcon(props: HTMLAttributes<HTMLOrSVGElement>) {
  const {className, ...other} = props

  return (
    <svg className={className} focusable="false" aria-hidden="true" viewBox="0 0 24 24" {...other}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"></path>
      </svg>
    </svg>
  )
})
