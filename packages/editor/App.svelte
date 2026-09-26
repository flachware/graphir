<script>
  import { View } from '@graphir/render'
  import Handle from './components/Handle.svelte'
  import Node from './components/Node.svelte'
  import Panel from './components/Panel.svelte'
  import Segment from './components/Segment.svelte'
  import Tangent from './components/Tangent.svelte'
  import { draggable } from './drag.js'
  import { shortcuts } from './shortcuts.js'
  import { bounce, carry, collinear, follow, guard } from './smooth.js'
  import * as blank from '../../examples/irs/blank.js'

  let anisotropy = $state(0.11)
  let debug = $state(false)
  let mode = $state('select')
  let selected = $state.raw(null)

  let glyph = $state({
    name: blank.name,
    closed: blank.closed,
    points: structuredClone(blank.points)
  })

  let view

  function onpointerdown(event) {
    if (mode === 'select') selected = null
    if (mode === 'draw') draw(view.locate(event))
  }

  // Starts the path in an empty glyph, or extends it at its last node while
  // that node is selected. The new segment is straight.
  function draw(position) {
    const { points } = glyph
    const x = Math.round(position.x)
    const y = Math.round(position.y)
    const last = points.at(-1)

    if (last && (selected !== last || glyph.closed)) return
    if (last && last.x === x && last.y === y) return

    points.push({ x, y, smooth: false })
    selected = points.at(-1)
  }

  // Closes the path when its first node is pressed while drawing from the
  // last node. The closing segment is straight.
  function close(event) {
    event.stopPropagation()

    glyph.closed = true
    selected = glyph.points[0]
  }

  function closable(point) {
    const { points } = glyph

    return !glyph.closed
      && points.length > 1
      && point === points[0]
      && selected === points.at(-1)
  }

  function onnodedown(point) {
    if (mode === 'select') return select(point)
    if (mode === 'draw' && closable(point)) return close
  }

  // Alt-pressing a straight segment gives it a T point at its midpoint.
  function onsegmentdown(i) {
    return event => {
      if (!event.altKey) return
      event.stopPropagation()

      const { points } = glyph
      const point = points[i]
      const next = points[(i + 1) % points.length]

      point.controlPoint ??= {
        x: Math.round((point.x + next.x) / 2),
        y: Math.round((point.y + next.y) / 2)
      }

      selected = point.controlPoint
    }
  }

  // A node can become smooth when both of its segments are curved. A smooth
  // node can always be turned back into a corner.
  function smoothable(i) {
    const { points, closed } = glyph
    const n = points.length
    const previous = points[(i - 1 + n) % n]
    const incoming = (closed || i > 0) && previous.controlPoint
    const outgoing = (closed || i < n - 1) && points[i].controlPoint

    return incoming && outgoing
  }

  function onnodedblclick(i) {
    if (mode !== 'select') return

    const point = glyph.points[i]

    if (point.smooth) return () => point.smooth = false
    if (smoothable(i)) return () => smoothen(i)
  }

  function smoothen(i) {
    align(i)
    settle()
    glyph.points[i].smooth = true
  }

  // Rounds all nodes and T points to whole pixels.
  function settle() {
    for (const point of glyph.points) {
      for (const p of [point, point.controlPoint]) {
        if (!p) continue
        p.x = Math.round(p.x)
        p.y = Math.round(p.y)
      }
    }
  }

  function align(i) {
    const { points } = glyph
    const n = points.length
    const point = points[i]
    const previous = points[(i - 1 + n) % n]
    const next = points[(i + 1) % n]

    collinear(
      previous,
      previous.controlPoint,
      point,
      point.controlPoint,
      next
    )
  }

  // The T points next to node i: of its outgoing and its incoming segment.
  function adjacent(i) {
    const { points, closed } = glyph
    const n = points.length

    return {
      outgoing: (closed || i < n - 1) && points[i].controlPoint,
      incoming: (closed || i > 0) && points[(i - 1 + n) % n].controlPoint
    }
  }

  // Positions of the moved item and its T points when a move starts.
  let anchor = new Map()

  function hold(item) {
    const i = glyph.points.indexOf(item)
    const { outgoing, incoming } = i >= 0 ? adjacent(i) : {}

    anchor = new Map(
      [item, outgoing, incoming]
        .filter(Boolean)
        .map(point => [point, { x: point.x, y: point.y }])
    )
  }

  // Adjusts the T points after item was moved, relative to where everything
  // was when the move started. A moved node keeps the directions of its
  // tangents, so its T points slide along the tangents at the neighboring
  // nodes. T points never pass a node: a moved node is mirrored back so its
  // tangents keep their angles, a moved T point is mirrored back itself.
  // Smooth nodes pull their opposite T point, so their tangents stay
  // collinear.
  function constrain(item) {
    const { points } = glyph
    const n = points.length
    const at = k => points[(k + n) % n]
    const i = points.indexOf(item)

    if (i >= 0) {
      const { outgoing, incoming } = adjacent(i)
      const S = anchor.get(item)

      if (outgoing) bounce(item, at(i + 1), S, anchor.get(outgoing))
      if (incoming) bounce(item, at(i - 1), S, anchor.get(incoming))

      if (outgoing) {
        carry(outgoing, at(i + 1), item, S, anchor.get(outgoing))
      }

      if (incoming) {
        carry(incoming, at(i - 1), item, S, anchor.get(incoming))
      }

      if (outgoing && incoming && item.smooth) {
        follow(incoming, at(i - 1), item, outgoing)
      }

      if (outgoing) keep(i + 1, outgoing)
      if (incoming) keep(i - 1, incoming)
      return
    }

    const j = points.findIndex(point => point.controlPoint === item)

    if (j < 0) return

    guard(item, at(j), anchor.get(item))
    guard(item, at(j + 1), anchor.get(item))
    keep(j, item)
    keep(j + 1, item)
  }

  // Snaps each coordinate of the moved item to the nearest matching
  // coordinate of another node or T point within the threshold. Points
  // that move along with the item are left out.
  const threshold = 10

  function snap(item) {
    const others = glyph.points
      .flatMap(point => [point, point.controlPoint])
      .filter(point => point && !anchor.has(point))

    for (const axis of ['x', 'y']) {
      const value = item[axis]
      let best = threshold

      for (const other of others) {
        const distance = Math.abs(other[axis] - value)

        if (distance < best) {
          best = distance
          item[axis] = other[axis]
        }
      }
    }
  }

  function move(item) {
    item.x = Math.round(item.x)
    item.y = Math.round(item.y)
    snap(item)
    constrain(item)
    settle()
  }

  // Keeps smooth node k collinear after its T point T was moved.
  function keep(k, T) {
    const { points } = glyph
    const n = points.length
    const at = k => points[(k + n) % n]
    const node = at(k)

    if (!node.smooth || !smoothable((k + n) % n)) return

    if (node.controlPoint === T) {
      follow(at(k - 1).controlPoint, at(k - 1), node, T)
    } else {
      follow(node.controlPoint, at(k + 1), node, T)
    }
  }

  function select(item) {
    return event => {
      event.stopPropagation()
      selected = item
    }
  }

  const arrows = {
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: 1 },
    ArrowDown: { x: 0, y: -1 }
  }

  function onkeydown(event) {
    if (event.key === shortcuts.debug) debug = !debug

    const arrow = arrows[event.key]
    const focused = event.target.closest?.('input')

    if (arrow && selected && !focused) {
      event.preventDefault()
      const step = event.shiftKey ? 10 : 1
      hold(selected)
      selected.x += arrow.x * step
      selected.y += arrow.y * step
      constrain(selected)
      settle()
    }
  }
</script>

<svelte:window {onkeydown} />

<div class={['editor', mode]}>
  <View
    glyphs={[glyph]}
    {anisotropy}
    {onpointerdown}
    bind:this={view}>
    {#snippet underlay(rendered)}
      {#each rendered as glyph}
        {#each glyph.segments as { P0, T, P3, straight }}
          {#if !straight}
            <Tangent from={P0} to={T} />
            <Tangent from={T} to={P3} />
          {/if}
        {/each}
      {/each}
    {/snippet}
    {#snippet overlay(rendered)}
      {#each rendered as glyph}
        {#each glyph.segments as segment, i}
          <Segment {segment} onpointerdown={onsegmentdown(i)} />
        {/each}
        {#each glyph.points as point}
          {#if point.controlPoint}
            <Handle
              point={point.controlPoint}
              selected={point.controlPoint === selected}
              onpointerdown={mode === 'select'
                ? select(point.controlPoint)
                : undefined}
              drag={mode === 'select'
                ? draggable(() => point.controlPoint, move, hold)
                : undefined} />
          {/if}
        {/each}
        {#each glyph.points as point, i}
          <Node
            {point}
            selected={point === selected}
            onpointerdown={onnodedown(point)}
            ondblclick={onnodedblclick(i)}
            drag={mode === 'select'
              ? draggable(() => point, move, hold)
              : undefined} />
        {/each}
      {/each}
    {/snippet}
  </View>
  <Panel bind:anisotropy bind:mode {selected} />
</div>
