<script>
  import { Renderer } from './renderer.js'
  import { scene } from './scene.js'

  let {
    glyphs = [],
    anisotropy,
    underlay,
    overlay,
    ...rest
  } = $props()

  let width = $state(0)
  let height = $state(0)

  let renderer = $derived(new Renderer({ anisotropy }))

  let rendered = $derived(glyphs.map(glyph => renderer.render(glyph)))

  let root = $derived(scene(rendered))

  let group

  // Maps the client position of a pointer event into glyph coordinates.
  export function locate(event) {
    const client = new DOMPoint(event.clientX, event.clientY)
    const { x, y } = client.matrixTransform(group.getScreenCTM().inverse())
    return { x, y }
  }
</script>

{#snippet node(n)}
  {#if n.type === 'group'}
    <g transform={n.transform}>
      {#each n.children as child}
        {@render node(child)}
      {/each}
    </g>
  {:else if n.type === 'path'}
    <path d={n.d} />
  {/if}
{/snippet}

<svg
  {...rest}
  class="render-view"
  viewBox="{-Math.floor(width / 2)} {-Math.floor(height / 2)} {width} {height}"
  bind:clientWidth={width}
  bind:clientHeight={height}>
  <g transform="scale(1 -1)" bind:this={group}>
    {@render underlay?.(rendered)}
    {@render node(root)}
    {@render overlay?.(rendered)}
  </g>
</svg>
