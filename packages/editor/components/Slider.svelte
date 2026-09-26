<script>
  let {
    label,
    min = 0,
    max = 1,
    step = 0.01,
    value = $bindable(),
    format = v => v
  } = $props()
</script>

<label class="slider">
  <span class="slider-label">{label}</span>
  <input type="range" {min} {max} {step} bind:value>
  <output>{format(value)}</output>
</label>
