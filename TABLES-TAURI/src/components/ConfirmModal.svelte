<script>
  export let isOpen = false;
  export let title = 'Are you sure?';
  export let message = 'This action cannot be undone.';
  export let confirmText = 'Delete';
  export let cancelText = 'Cancel';
  export let isDestructive = true;
  
  export let onConfirm = () => {};
  export let onCancel = () => {};
  
  let resolvePromise = null;
  
  // Open confirmation and return a promise
  export function open(options = {}) {
    return new Promise((resolve) => {
      resolvePromise = resolve;
      if (options.title) title = options.title;
      if (options.message) message = options.message;
      if (options.confirmText) confirmText = options.confirmText;
      if (options.cancelText) cancelText = options.cancelText;
      if (options.isDestructive !== undefined) isDestructive = options.isDestructive;
      isOpen = true;
    });
  }
  
  function handleConfirm() {
    isOpen = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
    onConfirm();
  }
  
  function handleCancel() {
    isOpen = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
    onCancel();
  }
  
  // Close on escape key
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={handleCancel} on:keydown={handleKeydown} tabindex="0">
    <div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <i class="fas {isDestructive ? 'fa-exclamation-triangle' : 'fa-question-circle'}"></i>
        <h2 id="modal-title">{title}</h2>
      </div>
      
      <div class="modal-body">
        <p>{message}</p>
      </div>
      
      <div class="modal-actions">
        <button class="btn-secondary" on:click={handleCancel}>
          {cancelText}
        </button>
        <button 
          class="btn {isDestructive ? 'btn-danger' : 'btn-primary'}" 
          on:click={handleConfirm}
          autofocus
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease-out;
  }
  
  .modal-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease-out;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .modal-header i {
    font-size: 24px;
    color: #f59e0b;
  }
  
  .modal-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }
  
  .modal-body {
    margin-bottom: 24px;
  }
  
  .modal-body p {
    color: #475569;
    line-height: 1.6;
    margin: 0;
  }
  
  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s;
  }
  
  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
  }
  
  .btn-secondary:hover {
    background: #e2e8f0;
  }
  
  .btn-danger {
    background: #ef4444;
    color: white;
  }
  
  .btn-danger:hover {
    background: #dc2626;
  }
  
  .btn-primary {
    background: #2563eb;
    color: white;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
