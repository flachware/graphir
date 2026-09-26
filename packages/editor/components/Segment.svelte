<script>
  let { segment, onpointerdown } = $props()
</script>

<path class="segment" d={segment.d} {onpointerdown} />
