<script>
  import { marked } from 'marked';
  let { content = '' } = $props();
</script>

{@html (content ? marked.parse(content) : '')}
