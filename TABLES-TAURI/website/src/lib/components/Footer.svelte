<script>
  import { t } from '../utils/localization';
  let { settings, currentLang = 'en' } = $props();
</script>

<footer>
  <div class="content">
    <div class="copyright">
      © {new Date().getFullYear()} {settings.siteTitle || 'TABLES'}. {t('builtWith', currentLang)}.
    </div>
  </div>
</footer>

<style>
  footer {
    padding: 3rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    margin-top: 4rem;
  }

  .content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    color: #64748b;
    font-size: 0.875rem;
  }
</style>
