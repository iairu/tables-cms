<script>
  import { onMount } from 'svelte';
  let { row } = $props();

  let videoRef = $state(null);
  let sectionRef = $state(null);
  let videoHeight = $state('675px');

  function ytUrlToEmbed(url) {
    if (!url) return '';
    if (url.includes('youtu.be/')) {
      return `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`;
    }
    if (url.includes('youtube.com/watch?v=')) {
      return `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
    }
    return url;
  }

  function handleVideoClasses(theme) {
    let classes = [];
    if (theme) {
      if (theme.includes('fullwidth')) classes.push('span');
      if (theme.includes('embedded')) classes.push('embedded');
      if (theme.includes('iphone')) classes.push('immersive');
      if (theme.includes('autoplay')) classes.push('autoplay');
    }
    return classes.join(' ');
  }

  function recalcHeight() {
    const width = (window.innerWidth < 1200) ? window.innerWidth : 1200;
    videoHeight = (width / 16 * 9) + 'px';
  }

  onMount(() => {
    recalcHeight();
    window.addEventListener('resize', recalcHeight);
    
    // Intersection observer for auto-play/pause
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (videoRef && videoRef.tagName === 'VIDEO') {
          if (entry.isIntersecting) {
            videoRef.play().catch(() => {});
          } else {
            videoRef.pause();
          }
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef) observer.observe(sectionRef);

    return () => {
      window.removeEventListener('resize', recalcHeight);
      observer.disconnect();
    };
  });

  let ytLink = $derived(row.fields?.youtubeUrl || '');
  let ytEmbed = $derived(ytUrlToEmbed(ytLink));
  let local = $derived(row.fields?.localVideo || '');
  let theme = $derived(row.fields?.specialTheme || '');
  let opacity = $derived((row.fields?.videoOpacity || 100) / 100);
  let classes = $derived(handleVideoClasses(theme));
</script>

<section bind:this={sectionRef} class="video {classes}">
  {#if ytEmbed}
    <div class="iframe-wrapper" style="padding-bottom: {theme.includes('iphone') ? '0' : '56.25%'}; height: {theme.includes('iphone') ? '600px' : '0'};">
      <iframe
        title={row.fields?.videoTitle || "Video"}
        src="{ytEmbed}{theme.includes('autoplay') ? '?autoplay=1&mute=1&loop=1' : ''}"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
  {:else if local}
    <video
      bind:this={videoRef}
      src={local}
      style="max-height: {videoHeight}; opacity: {opacity};"
      muted={theme.includes('autoplay')}
      loop={theme.includes('autoplay')}
      autoplay={theme.includes('autoplay')}
      playsinline
      controls={!theme.includes('autoplay')}
    ></video>
  {/if}
</section>

<style>
  section.video {
    display: flex;
    justify-content: center;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  video, iframe {
    width: 100%;
    height: 55vh;
    max-width: 1200px;
    background: transparent;
  }

  .span video, .span iframe {
    max-width: none;
    object-fit: cover;
  }

  .iframe-wrapper {
    width: 100%;
    position: relative;
    max-width: 1200px;
  }
  
  .span .iframe-wrapper { max-width: none; }

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .immersive video, .immersive iframe {
    padding: 8% 6%;
    box-sizing: border-box;
    background: black;
  }
</style>
