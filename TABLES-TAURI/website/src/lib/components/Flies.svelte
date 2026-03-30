<script>
  import { onMount } from 'svelte';
  
  let { row } = $props();
  let sectionRef = $state(null);
  let overlayHeight = $state(0);

  function findDiffElmBelow(elm) {
    if (elm && elm.parentElement) {
      const siblings = Array.from(elm.parentElement.children);
      const elmIdx = siblings.indexOf(elm);
      let elmIdxBelow = elmIdx + 1;
      // Skip siblings with the same class (grouping flies)
      while (elmIdxBelow < siblings.length && siblings[elmIdxBelow].className === elm.className) {
        elmIdxBelow++;
      }
      return siblings[elmIdxBelow];
    }
    return null;
  }

  function recalcOverlayHeight() {
    if (sectionRef) {
      const below = findDiffElmBelow(sectionRef);
      if (below) {
        overlayHeight = below.clientHeight;
      }
    }
  }

  onMount(() => {
    recalcOverlayHeight();
    window.addEventListener('resize', recalcOverlayHeight);
    return () => window.removeEventListener('resize', recalcOverlayHeight);
  });

  function handleFlyStyle(fly) {
    let style = "";
    if (fly.marginFromTop) style += `top: ${fly.marginFromTop}%; `;
    if (fly.stickToRightSide) {
      style += `right: ${fly.marginFromEdge || 0}%; `;
    } else {
      style += `left: ${fly.marginFromEdge || 0}%; `;
    }
    
    let transforms = [];
    if (fly.rotation) transforms.push(`rotate(${fly.rotation}deg)`);
    if (fly.scalingFactor && fly.scalingFactor > 0) transforms.push(`scale(${fly.scalingFactor})`);
    if (transforms.length > 0) style += `transform: ${transforms.join(' ')}; `;
    
    if (fly.transparency) style += `opacity: ${fly.transparency / 100}; `;
    
    return style;
  }
</script>

<section bind:this={sectionRef} class="flies">
  <div class="overlay" style="
    height: {overlayHeight ? `${overlayHeight}px` : 'auto'};
    overflow: {row.fields?.hideOverflow ? 'hidden' : 'visible'};
    mix-blend-mode: {row.fields?.blendMode || 'normal'};
  ">
    {#if row.fields?.flies}
      {#each row.fields.flies as fly}
        {#if fly.backgroundImage}
          <img 
            src={fly.backgroundImage} 
            alt={fly.altText || 'Fly'} 
            class="fly-img {fly.showOnMobile ? '' : 'hide-m'}"
            style="{handleFlyStyle(fly)}"
          />
        {/if}
      {/each}
    {/if}
  </div>
</section>

<style>
  section.flies {
    display: flex;
    width: 100%;
    position: relative;
    height: 0;
    max-height: 0;
    overflow: visible;
    pointer-events: none;
  }

  .overlay {
    position: absolute;
    width: 100%;
    z-index: 150;
    box-sizing: border-box;
    pointer-events: none;
  }

  .fly-img {
    width: 100%;
    max-width: 10vw;
    position: absolute;
    pointer-events: none;
  }

  @media (max-width: 1200px) {
    .hide-m { display: none !important; }
  }
</style>
