<script>
  let { row } = $props();
  
  // Basic translation of the legacy logic
  let isDark = $derived(row.fields?.darkTheme || row.fields?.darkMode);
  let boxes = $derived(row.fields?.boxes || []);

  function handleBoxStyle(box) {
    if (box.horizontalAdjustment || box.verticalAdjustment) {
      return `transform: translate(${box.horizontalAdjustment || 0}px, ${box.verticalAdjustment || 0}px);`;
    }
    return "";
  }
</script>

<section class="floaters {isDark ? 'dark' : ''}" style="
      background-color: {isDark ? 'black' : 'white'};
      background-image: {row.fields?.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none'};
      background-size: cover;
      background-position: center;
">
  {#if boxes.length > 0}
    <div class="wrapper">
      {#each boxes as box}
        <div class="box" style="{handleBoxStyle(box)}">
          {#if box.heading}
            <div class="heading">{@html box.heading}</div>
          {/if}
          {#if box.subheading}
            <div class="subheading">{@html box.subheading}</div>
          {/if}
          {#if box.icon}
            <img src={box.icon} alt={box.heading || 'Icon'} class="icon" />
          {/if}
          {#if box.text}
            <div class="text">{@html box.text}</div>
          {/if}
          {#if box.lowerCornerText}
            <div class="corner">{@html box.lowerCornerText}</div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  section {
    display: flex;
    flex-flow: row;
    justify-content: center;
    box-sizing: border-box;
    width: '100%';
    z-index: 9;
    padding: 50px 0;
  }
  
  .wrapper {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    margin: 50px;
    width: 100%;
    max-width: 1200px;
  }
  
  .box {
    display: flex;
    flex-flow: column;
    border: 1px solid #e2e8f0;
    padding: 15px;
    margin: 5px;
    width: 100%;
    max-width: 300px;
    transition: all 0.3s ease;
  }
  
  .dark .box {
    border-color: #424242;
    background-color: black;
    color: white;
  }
  
  .heading {
    margin: 0;
    text-transform: uppercase;
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  .subheading {
    margin: 0;
    color: gray;
    font-size: 1rem;
  }
  
  .icon {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 10px 0 0;
    padding: 30px;
    box-sizing: border-box;
  }
  
  .text {
    flex-grow: 1;
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .corner {
    display: block;
    width: 100%;
    text-align: right;
    font-size: 0.875rem;
    color: #94a3b8;
  }

  @media (max-width: 900px) {
    .box {
      transform: none !important;
    }
  }
</style>
