<script>
  import { isLoading } from '../stores/loading.js';

  let loadingValue;
  const unsubscribe = isLoading.subscribe(value => loadingValue = value);
</script>

{#if loadingValue}
  <div class="loading-bar">
    <div class="loading-progress"></div>
  </div>
{/if}

<style>
  .loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: transparent;
    z-index: 9999;
  }

  .loading-progress {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #10b981);
    width: 100%;
    animation: loading-pulse 1.5s ease-in-out infinite;
  }

  @keyframes loading-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }
</style>
