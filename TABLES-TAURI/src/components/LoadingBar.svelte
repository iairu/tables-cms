<script>
  import { isLoading } from '../stores/loading.js';
  
  let isLoadingValue;
  const unsubscribe = isLoading.subscribe(value => isLoadingValue = value);
</script>

{#if isLoadingValue}
  <div class="loading-bar">
    <div class="loading-bar-progress"></div>
  </div>
{/if}

<style>
  .loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: transparent;
    z-index: 9999;
  }

  .loading-bar-progress {
    height: 100%;
    background: linear-gradient(90deg, #2563eb, #10b981, #2563eb);
    background-size: 200% 100%;
    animation: loading-shimmer 1.5s ease-in-out infinite;
    transition: width 0.3s ease-out;
    width: 100%;
  }

  @keyframes loading-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  @keyframes loading-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
