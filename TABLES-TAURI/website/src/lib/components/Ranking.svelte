<script>
  let { row } = $props();
  let isDark = $derived(row.fields?.darkTheme || row.fields?.darkMode);
  let ranks = $derived(row.fields?.ranks || []);
</script>

<section class="ranking {isDark ? 'dark' : ''}" style="
  background-color: {isDark ? 'black' : '#e5e7eb'};
  background-image: {row.fields?.backgroundImage ? `url(${row.fields.backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
">
  {#if ranks.length > 0}
    <ul class="content">
      {#each ranks as rank}
        <li>
          <div class="count">{@html rank.heading || ''}</div>
          <span class="name">{@html rank.subheading || ''}</span>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  section.ranking {
    display: flex;
    flex-flow: row;
    width: 100%;
    padding: 2em;
    box-sizing: border-box;
  }

  .content {
    display: flex;
    flex-flow: row wrap;
    width: 100%;
    justify-content: space-around;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  li {
    padding: 1em;
    display: flex;
    flex-flow: column;
    text-transform: uppercase;
    align-items: center;
  }

  .count {
    font-size: 3em;
    font-weight: 900;
    margin: 0;
    -webkit-text-stroke: 2px currentColor;
    -webkit-text-fill-color: transparent;
  }

  .name {
    font-size: 1rem;
    font-weight: 600;
  }

  @media (max-width: 500px) {
    .count { font-size: 2.5em !important; }
  }
</style>
