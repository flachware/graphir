<script>
  let { point, selected = false, onpointerdown, drag } = $props()
</script>

<circle
  class={['handle', { selected, selectable: onpointerdown }]}
  cx={point.x}
  cy={point.y}
  r={4}
  {onpointerdown}
  {@attach drag} />
