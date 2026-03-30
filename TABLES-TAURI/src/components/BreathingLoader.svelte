<script>
  // Breathing loading icon for app initialization
  export let size = 48;
  export let color = 'var(--color-primary, #2563eb)';
</script>

<div class="breathing-loader" style="--size: {size}px; --color: {color}">
  <div class="loader-circle"></div>
  <div class="loader-circle"></div>
  <div class="loader-circle"></div>
  <div class="loader-center">
    <i class="fas fa-table"></i>
  </div>
</div>

<style>
  .breathing-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    position: relative;
  }

  .loader-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top-color: var(--color);
    border-radius: 50%;
    animation: breathe 2s ease-in-out infinite;
  }

  .loader-circle:nth-child(1) {
    animation-delay: 0s;
  }

  .loader-circle:nth-child(2) {
    width: 70%;
    height: 70%;
    animation-delay: 0.2s;
    border-top-color: color-mix(in srgb, var(--color) 70%, transparent);
  }

  .loader-circle:nth-child(3) {
    width: 40%;
    height: 40%;
    animation-delay: 0.4s;
    border-top-color: color-mix(in srgb, var(--color) 40%, transparent);
  }

  .loader-center {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    animation: pulse-icon 2s ease-in-out infinite;
  }

  .loader-center i {
    font-size: calc(var(--size) * 0.4);
    color: var(--color);
    opacity: 0.8;
  }

  @keyframes breathe {
    0%, 100% {
      transform: rotate(0deg) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: rotate(180deg) scale(1.1);
      opacity: 1;
    }
  }

  @keyframes pulse-icon {
    0%, 100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
  }
</style>
