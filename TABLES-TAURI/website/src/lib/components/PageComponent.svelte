<script>
  import TitleSlide from './TitleSlide.svelte';
  import Boxes from './Boxes.svelte';
  import Infobar from './Infobar.svelte';
  import Flies from './Flies.svelte';
  import Slide from './Slide.svelte';
  import Video from './Video.svelte';
  import Ranking from './Ranking.svelte';
  import References from './References.svelte';
  import Reviews from './Reviews.svelte';
  import Slideshow from './Slideshow.svelte';

  let { row } = $props();

  const components = {
    TitleSlide,
    Boxes,
    Infobar,
    Flies,
    Slide,
    Video,
    Ranking,
    References,
    Reviews,
    Slideshow
  };
</script>

{#if components[row.component]}
  {@const Component = components[row.component]}
  <Component {row} />
{/if}
