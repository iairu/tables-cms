<script>
  let { row } = $props();
  
  let isDark = $derived(row.fields?.darkTheme || row.fields?.darkMode);
  let align = $derived(row.fields?.alignment || 'left');
  let headingSize = $derived(row.fields?.headingSize || 'normal');
  let minHeight = $derived(row.fields?.minimalHeight || 0);
  
  let bgColor = $derived(row.fields?.backgroundColor || (isDark ? 'black' : '#f2f2f2'));
  let bgTexture = $derived(row.fields?.backgroundTexture ? `url(${row.fields.backgroundTexture})` : 'none');
  
  // Format heading with line breaks for left alignment as in legacy
  let formattedHeading = $derived(() => {
    const h = row.fields?.heading || '';
    if (align === 'left' && typeof h === 'string') {
      return h.replace(/\s/g, '<br>');
    }
    return h;
  });
</script>

<section 
  class="titulka {isDark ? 'dark' : ''}"
  style="
    background-color: {bgColor};
    background-image: {bgTexture};
    min-height: {minHeight ? `${minHeight}vh` : 'auto'};
  "
>
  {#if row.fields?.backgroundImage || row.fields?.mobileBackgroundImage || row.fields?.backgroundVideo}
    <div class="pic {row.fields?.scaleImageToWholeBackground || row.fields?.backgroundVideo ? 'cover' : ''}">
      {#if row.fields?.backgroundImage}
        <img 
          src={row.fields.backgroundImage} 
          alt="Title" 
          class="pic-img {row.fields?.mobileBackgroundImage ? 'hide-m' : ''}"
          style="object-fit: {row.fields?.scaleImageToWholeBackground ? 'cover' : 'contain'};"
        />
      {/if}
      {#if row.fields?.mobileBackgroundImage}
        <img 
          src={row.fields.mobileBackgroundImage} 
          alt="Mobile Title" 
          class="pic-img hide-d" 
          style="object-fit: {row.fields?.scaleImageToWholeBackground ? 'cover' : 'contain'};"
        />
      {/if}
      {#if row.fields?.backgroundVideo}
        <video 
          src={row.fields.backgroundVideo} 
          autoplay loop muted playsinline 
          style="opacity: {(row.fields?.videoOpacity || 100) / 100};"
        ></video>
      {/if}
    </div>
  {/if}

  <div class="content {align}">
    {#if row.fields?.heading}
      <h1 class={headingSize === 'big' ? 'big' : 'normal'}>
        {@html formattedHeading()}
      </h1>
    {/if}
    {#if row.fields?.text}
      <div class="text">{@html row.fields.text}</div>
    {/if}
    {#if row.fields?.buttons && row.fields.buttons.length > 0}
      <nav class="nav">
        {#each row.fields.buttons as button}
          <a 
            href={button.link} 
            target={button.openAsPopup ? '_blank' : '_self'}
            class={button.showAsButton ? 'btn-page' : 'link-page'}
          >
            {#if button.icon}<span>{button.icon}</span>{/if}
            {button.title}
          </a>
        {/each}
      </nav>
    {/if}
  </div>
</section>

<style>
  section.titulka {
    display: flex;
    position: relative;
    flex-flow: column;
    justify-content: flex-end;
    box-sizing: border-box;
    background-position: center;
    padding: 2em;
    width: 100%;
    overflow: hidden;
  }

  .titulka.dark { color: white; }

  .pic {
    display: flex;
    width: 100%;
    top: 15px;
    left: 0;
    height: 100%;
    justify-content: center;
    position: absolute;
    bottom: 0;
  }

  .pic.cover { top: 0; }
  
  .pic img, .pic video {
    height: 100%;
    max-width: 90%;
    object-fit: contain;
  }

  .pic.cover img, .pic.cover video {
    max-width: 100%;
    width: 100%;
    object-fit: cover;
  }

  .content {
    display: flex;
    flex-flow: column;
    position: relative;
    width: 100%;
    margin-top: 2em;
    margin-bottom: 2em;
    z-index: 99;
    padding: 0 15%;
    box-sizing: border-box;
  }

  .content.left { align-items: flex-start; text-align: left; }
  .content.center { align-items: center; text-align: center; }
  .content.right { align-items: flex-end; text-align: right; }

  h1.big { font-size: 4rem; font-weight: 700; line-height: 1.1; }
  h1.normal { font-size: 2.5rem; font-weight: 700; }

  .text { font-size: 1.25rem; line-height: 1.75; margin-bottom: 2rem; }

  .nav { display: flex; gap: 1rem; flex-wrap: wrap; }

  .btn-page {
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    color: white;
    text-decoration: none;
    font-weight: 600;
  }

  .link-page {
    padding: 0.5rem;
    color: inherit;
    text-decoration: underline;
    font-weight: 600;
  }

  @media (max-width: 1200px) {
    .content { padding: 0; }
    .pic { top: 0 !important; }
    .pic img { object-fit: cover; max-width: 100%; }
  }

  @media (max-width: 800px) { .hide-m { display: none !important; } }
  @media (min-width: 801px) { .hide-d { display: none !important; } }
</style>
