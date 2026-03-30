<script>
  let { row } = $props();
  let isDark = $derived(row.fields?.darkTheme || row.fields?.darkMode);
</script>

<section class="bar {isDark ? 'dark' : 'light'}" style="
  background-color: {isDark ? 'black' : '#f4f4f4'};
  color: {isDark ? 'white' : 'black'};
">
  {#if row.fields?.logo}
    <img src={row.fields.logo} alt="Logo" class="logo" />
  {:else if row.fields?.alternativeIcon}
    <big class="icon"><i class={row.fields.alternativeIcon}></i></big>
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
          class={button.showAsButton ? 'btn-small' : 'link-small'}
        >
          {#if button.icon}<span>{button.icon}</span>{/if}
          {button.title}
        </a>
      {/each}
    </nav>
  {/if}
</section>

<style>
  section.bar {
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 60px;
    padding: 10px 15px;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    box-sizing: border-box;
  }

  .dark { border-color: #424242; }

  .logo { max-height: 40px; margin-right: 3em; }
  .icon { font-size: 48px; margin-right: 1em; }
  .text { margin-right: 3em; flex-shrink: 0; }
  .nav { display: flex; flex-wrap: wrap; gap: 0.5rem; }

  .btn-small {
    padding: 0.5rem 1rem;
    background: #2563eb;
    color: white;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .link-small {
    padding: 0.25rem;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
  }

  @media (max-width: 1200px) {
    section.bar {
      flex-flow: column;
      padding: 1em;
    }
    section.bar > * { margin-right: 0 !important; margin-bottom: 1em; }
  }
</style>
