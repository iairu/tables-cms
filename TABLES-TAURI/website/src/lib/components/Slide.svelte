<script>
  let { row } = $props();
  
  let leftDark = $derived(row.fields?.leftDarkTheme);
  let rightDark = $derived(row.fields?.rightDarkTheme);
  let big = $derived(row.fields?.largerSlide);
  let reorderM = $derived(row.fields?.switchOrderOnMobile);
</script>

<section class="slide {reorderM ? 'reorder-m' : ''}">
  <div 
    class="left {leftDark ? 'dark' : ''} {row.fields?.hideLeftOnMobile ? 'hide-m' : ''}"
    style="
      background-color: {row.fields?.leftBackgroundColor || '#f4f4f4'};
      background-image: {row.fields?.leftBackgroundImage ? `url(${row.fields.leftBackgroundImage})` : 'none'};
      min-height: {row.fields?.minimalLeftHeight ? `${row.fields.minimalLeftHeight}vh` : (big ? '70vh' : '30vh')};
      background-size: {row.fields?.fitLeftBackground ? 'contain' : 'cover'};
    "
  >
    {#if row.fields?.leftHeading}<div class="heading">{@html row.fields.leftHeading}</div>{/if}
    {#if row.fields?.leftText}<div class="text">{@html row.fields.leftText}</div>{/if}
    {#if row.fields?.leftButtons && row.fields.leftButtons.length > 0}
      <nav class="nav">
        {#each row.fields.leftButtons as btn}
          <a href={btn.link} class={btn.showAsButton ? 'btn-page' : 'link-page'}>{btn.title}</a>
        {/each}
      </nav>
    {/if}
  </div>

  <div 
    class="right {rightDark ? 'dark' : ''} {row.fields?.hideRightOnMobile ? 'hide-m' : ''}"
    style="min-height: {row.fields?.minimalRightHeight ? `${row.fields.minimalRightHeight}vh` : (big ? '70vh' : '30vh')};"
  >
    {#if row.fields?.rightHeading}<div class="heading">{@html row.fields.rightHeading}</div>{/if}
    {#if row.fields?.rightText}<div class="text">{@html row.fields.rightText}</div>{/if}
    
    <div class="under" style="
      background-color: {row.fields?.rightBackgroundColor || 'white'};
      background-image: {row.fields?.rightBackgroundImage ? `url(${row.fields.rightBackgroundImage})` : 'none'};
      background-size: {row.fields?.fitRightBackground ? 'contain' : 'cover'};
    "></div>
  </div>
</section>

<style>
  section.slide {
    display: flex;
    flex-flow: row;
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .left {
    width: 50%;
    padding: 2em 4em 2em 2em;
    display: flex;
    flex-flow: column;
    justify-content: center;
    clip-path: polygon(0 0, 100% 0, calc(100% - 50px) 100%, 0 100%);
    z-index: 10;
  }

  .right {
    width: 50%;
    padding: 2em 4em 2em 2em;
    display: flex;
    flex-flow: column;
    justify-content: center;
    z-index: 9;
  }

  .under {
    position: absolute;
    right: 0; top: 0; bottom: 0;
    left: -50px;
    width: calc(100% + 50px);
    z-index: -1;
  }

  .dark { color: white; background: black; }
  .heading { font-size: 3em; margin-bottom: 0.5em; font-weight: 700; }
  .text { font-size: 1.125rem; line-height: 1.75; }
  .nav { display: flex; gap: 1rem; }

  @media (max-width: 1200px) {
    section.slide { flex-flow: column; }
    .left, .right { width: 100%; clip-path: none; padding: 2em; }
    .under { left: 0; width: 100%; }
    .reorder-m .right { order: -1; }
    .hide-m { display: none !important; }
  }
</style>
