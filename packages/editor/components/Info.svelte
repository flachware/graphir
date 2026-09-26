<script>
  let { point } = $props()

  const format = value => Number(value.toFixed(2))
</script>

<dl class="info">
  <dt>x</dt>
  <dd>{point ? format(point.x) : '–'}</dd>
  <dt>y</dt>
  <dd>{point ? format(point.y) : '–'}</dd>
</dl>
