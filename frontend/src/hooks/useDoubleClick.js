import { useRef } from 'react'

export function useDoubleClick(onSingleClick, onDoubleClick, delay = 300) {
  const timer = useRef(null)

  return (e) => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
      onDoubleClick(e)
    } else {
      timer.current = setTimeout(() => {
        timer.current = null
        onSingleClick(e)
      }, delay)
    }
  }
}
