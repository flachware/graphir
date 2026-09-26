<script>
  import Info from './Info.svelte'
  import Slider from './Slider.svelte'
  import ToggleGroup from './ToggleGroup.svelte'

  let {
    anisotropy = $bindable(),
    mode = $bindable(),
    selected
  } = $props()
</script>

<div class="panel">
  <ToggleGroup
    options={[
      { value: 'select', label: 'Select' },
      { value: 'draw', label: 'Draw' }
    ]}
    bind:value={mode} />
  <Slider
    label="Anisotropy"
    min={0}
    max={1}
    step={0.01}
    bind:value={anisotropy}
    format={v => `${Math.round(v * 100)}%`} />
  <Info point={selected} />
</div>
