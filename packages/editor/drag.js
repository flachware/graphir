// Minimum pointer movement in pixels before a drag starts.
const threshold = 5

// Returns an attachment that moves the point returned by get while its
// element is dragged. The drag only starts once the pointer has moved by
// the threshold. onstart is called with the point when a drag starts,
// onmove after each move. Pointer positions are mapped into the element's
// own coordinate system, so this works regardless of how the view
// transforms its content.
export function draggable(get, onmove, onstart) {
  return element => {
    let point = null
    let matrix = null
    let offset = null
    let down = null
    let dragging = false

    function local(event) {
      const client = new DOMPoint(event.clientX, event.clientY)
      const { x, y } = client.matrixTransform(matrix)
      return { x, y }
    }

    function onpointerdown(event) {
      element.setPointerCapture(event.pointerId)
      point = get()
      down = { x: event.clientX, y: event.clientY }
      dragging = false
      matrix = element.getScreenCTM().inverse()
      const { x, y } = local(event)
      offset = { x: point.x - x, y: point.y - y }
    }

    function onpointermove(event) {
      if (!offset) return

      if (!dragging) {
        const dx = event.clientX - down.x
        const dy = event.clientY - down.y

        if (Math.hypot(dx, dy) < threshold) return

        dragging = true
        onstart?.(point)
      }

      const { x, y } = local(event)
      point.x = x + offset.x
      point.y = y + offset.y
      onmove?.(point)
    }

    function onpointerup(event) {
      offset = null
      element.releasePointerCapture(event.pointerId)
    }

    element.addEventListener('pointerdown', onpointerdown)
    element.addEventListener('pointermove', onpointermove)
    element.addEventListener('pointerup', onpointerup)

    return () => {
      element.removeEventListener('pointerdown', onpointerdown)
      element.removeEventListener('pointermove', onpointermove)
      element.removeEventListener('pointerup', onpointerup)
    }
  }
}
