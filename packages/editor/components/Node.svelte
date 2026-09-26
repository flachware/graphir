<script>
  let {
    point,
    selected = false,
    onpointerdown,
    ondblclick,
    drag
  } = $props()
</script>

{#if point.smooth}
  <circle
    class={['node', 'smooth', { selected, selectable: onpointerdown }]}
    cx={point.x}
    cy={point.y}
    r={5}
    {onpointerdown}
    {ondblclick}
    {@attach drag} />
{:else}
  <rect
    class={['node', { selected, selectable: onpointerdown }]}
    x={point.x - 4}
    y={point.y - 4}
    width={8}
    height={8}
    {onpointerdown}
    {ondblclick}
    {@attach drag} />
{/if}
