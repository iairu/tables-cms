<script>
  import { onMount } from 'svelte';
  let { row } = $props();
  
  let isDark = $derived(row.fields?.darkTheme || row.fields?.darkMode);
  let images = $derived(row.fields?.images || []);
  
  let sectionRef = $state(null);
  let contentRef = $state(null);
  let isAnimating = $state(false);

  onMount(() => {
    let interval;
    const scrollSpeed = 0.5;
    let scrollPos = 0;

    function setup() {
      if (!sectionRef || !contentRef) return;
      isAnimating = contentRef.scrollWidth > sectionRef.clientWidth;
      
      if (isAnimating) {
        interval = setInterval(() => {
          scrollPos += scrollSpeed;
          if (scrollPos >= contentRef.scrollWidth / 2) {
            scrollPos = 0;
          }
          sectionRef.scrollLeft = scrollPos;
        }, 16);
      }
    }

    setup();
    window.addEventListener('resize', setup);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', setup);
    };
  });
</script>

<section 
  bind:this={sectionRef} 
  class="ref {isDark ? 'dark' : ''} {isAnimating ? 'animate' : ''}"
  style="background-color: {isDark ? '#313131' : '#d1d5db'};"
>
  {#if images.length > 0}
    <div bind:this={contentRef} class="content">
      {#each [...images, ...images] as image}
        <img 
          src={image.imageUrl} 
          alt={image.altText || 'Reference'} 
          style="width: {image.width ? `${image.width}px` : '150px'}; height: {image.height ? `${image.height}px` : '70px'};"
        />
      {/each}
    </div>
  {/if}
</section>

<style>
  section.ref {
    display: flex;
    position: relative;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    padding: 2em 0;
    justify-content: center;
  }

  section.ref.animate { justify-content: flex-start; }

  .content {
    display: flex;
    flex-flow: row;
    flex-wrap: nowrap;
    flex-shrink: 0;
    align-items: center;
  }

  img {
    position: relative;
    object-fit: contain;
    margin: 1em;
  }
</style>
