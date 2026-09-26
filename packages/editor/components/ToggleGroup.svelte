<script>
  let { options, value = $bindable() } = $props()
</script>

<div class="toggle-group" role="group">
  {#each options as option}
    <button
      type="button"
      aria-pressed={value === option.value}
      onclick={() => value = option.value}>
      {option.label}
    </button>
  {/each}
</div>
