<script>
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  
  let { row } = $props();
  let isDark = $derived(row.fields?.darkTheme || row.fields?.darkMode);
  let reviews = $derived(row.fields?.reviews || []);
  
  let currentSlide = $state(0);
  let isPaused = $state(false);

  onMount(() => {
    if (reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      if (!isPaused) {
        currentSlide = (currentSlide + 1) % reviews.length;
      }
    }, 5000);
    
    return () => clearInterval(interval);
  });

  function next() { currentSlide = (currentSlide + 1) % reviews.length; isPaused = true; setTimeout(() => isPaused = false, 2500); }
  function prev() { currentSlide = (currentSlide - 1 + reviews.length) % reviews.length; isPaused = true; setTimeout(() => isPaused = false, 2500); }
</script>

<section 
  class="bubbles {isDark ? 'dark' : ''}"
  onmouseenter={() => isPaused = true}
  onmouseleave={() => isPaused = false}
  aria-roledescription="carousel"
  aria-label="Customer Reviews"
  style="background: {isDark ? 'black' : 'white'}; color: {isDark ? 'white' : 'black'};"
>
  <div class="slides">
    {#each reviews as review, i}
      {#if i === currentSlide}
        <div class="slide" in:fade={{ duration: 500 }} out:fade={{ duration: 500 }}>
          {#if review.text}<div class="text">{@html review.text}</div>{/if}
          {#if review.author}<div class="author">~ {review.author}</div>{/if}
          {#if review.stars}
            <div class="stars">
              {#each Array(review.stars) as _}★{/each}
              {#each Array(5 - review.stars) as _}☆{/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  {#if reviews.length > 1}
    <button class="nav prev" onclick={prev}>«</button>
    <button class="nav next" onclick={next}>»</button>
  {/if}
</section>

<style>
  section.bubbles {
    height: 250px;
    width: 100%;
    display: flex;
    position: relative;
    box-sizing: border-box;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .slides {
    position: relative;
    width: 100%;
    max-width: 900px;
    height: 100%;
  }

  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border: 1px solid #e2e8f0;
    padding: 25px 40px;
    box-sizing: border-box;
  }

  .dark .slide { border-color: #424242; background: black; }

  .text { font-size: 1.125rem; line-height: 1.75; font-style: italic; margin-bottom: 1rem; }
  .author { text-align: right; font-weight: bold; font-style: italic; }
  .stars {
    position: absolute;
    font-size: 24px;
    left: 10px;
    bottom: 10px;
    color: goldenrod;
  }

  .nav {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #0083FF;
    background: white;
    color: #0083FF;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .dark .nav { background: #262626; }
  .prev { left: 20px; }
  .next { right: 20px; }
</style>
