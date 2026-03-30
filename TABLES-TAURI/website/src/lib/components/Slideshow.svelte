<script>
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  let { slides = [], minHeight = '30', maxHeight = '70' } = $props();
  
  let currentSlide = $state(0);
  let isPaused = $state(false);

  onMount(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      if (!isPaused) currentSlide = (currentSlide + 1) % slides.length;
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div 
  class="slideshow" 
  onmouseenter={() => isPaused = true}
  onmouseleave={() => isPaused = false}
  style="min-height: {minHeight}vh; max-height: {maxHeight}vh;"
>
  {#if slides.length > 0}
    {#each slides as slide, i}
      {#if i === currentSlide}
        <div class="slide-wrap" in:fade out:fade>
          <div class="slide-bg" style="background-image: url({slide.backgroundImage});"></div>
          <div class="slide-content">
            {#if slide.heading}<h2>{@html slide.heading}</h2>{/if}
            {#if slide.text}<p>{@html slide.text}</p>{/if}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
  
  {#if slides.length > 1}
    <div class="nav-dots">
      {#each slides as _, i}
        <button class="dot {i === currentSlide ? 'active' : ''}" onclick={() => currentSlide = i}></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .slideshow {
    position: relative;
    width: 100%;
    background: #000;
    overflow: hidden;
    color: white;
  }

  .slide-wrap {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .slide-bg {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0.6;
  }

  .slide-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 2em;
    max-width: 800px;
  }

  h2 { font-size: 3rem; margin-bottom: 1rem; }
  
  .nav-dots {
    position: absolute;
    bottom: 20px;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 10px;
    z-index: 10;
  }

  .dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    background: transparent;
    cursor: pointer;
    padding: 0;
  }

  .dot.active { background: white; }
</style>
