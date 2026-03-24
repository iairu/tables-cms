<script>
  import { cmsData, requestLock, releaseLock } from '../../stores/cmsData.js';
  
  export let fieldId = '';
  export let value = '';
  export let type = 'text';
  export let placeholder = '';
  export let disabled = false;
  export let multiline = false;
  export let rows = 3;
  export let className = '';
  export let onChange = null;
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let localValue = value;
  
  $: lockInfo = getLockInfo(fieldId);
  $: isLocked = lockInfo !== null && lockInfo.socketId !== cmsDataValue?.collabState?.socketId;
  $: lockedBy = lockInfo?.clientName || 'Someone';
  
  function getLockInfo(fieldId) {
    if (!cmsDataValue?.collabState?.activeLocks) return null;
    return cmsDataValue.collabState.activeLocks.find(l => l.fieldId === fieldId);
  }
  
  function handleFocus() {
    if (cmsDataValue?.collabState?.isConnected && !isLocked) {
      requestLock(fieldId);
    }
  }
  
  function handleBlur() {
    if (cmsDataValue?.collabState?.isConnected) {
      releaseLock(fieldId);
    }
  }
  
  function handleChange(event) {
    localValue = event.target.value;
    if (onChange) {
      onChange(event);
    }
  }
  
  // Sync with external value changes
  $: if (value !== localValue && document.activeElement !== event?.target) {
    localValue = value;
  }
</script>

<div class="locked-input-wrapper {className}" class:locked={isLocked}>
  {#if isLocked}
    <div class="lock-indicator">
      <i class="fas fa-lock"></i>
      <span>Editing by {lockedBy}</span>
    </div>
  {/if}
  
  {#if multiline}
    <textarea
      {value: localValue}
      {placeholder}
      {disabled}
      {rows}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:input={handleChange}
      class="locked-input locked-textarea"
      class:locked={isLocked}
    ></textarea>
  {:else}
    <input
      {type}
      {value: localValue}
      {placeholder}
      {disabled}
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:input={handleChange}
      class="locked-input"
      class:locked={isLocked}
    />
  {/if}
  
  {#if isLocked}
    <div class="lock-overlay"></div>
  {/if}
</div>

<style>
  .locked-input-wrapper {
    position: relative;
    width: 100%;
  }
  
  .locked-input {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s;
    background: white;
  }
  
  .locked-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .locked-input.locked {
    background: #f1f5f9;
    cursor: not-allowed;
  }
  
  .locked-textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .lock-indicator {
    position: absolute;
    top: -8px;
    right: 8px;
    background: #fef3c7;
    color: #92400e;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .lock-indicator i {
    font-size: 10px;
  }
  
  .lock-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(241, 245, 249, 0.5);
    border-radius: 6px;
    cursor: not-allowed;
    z-index: 5;
  }
  
  .locked-input-wrapper.locked:hover .lock-indicator {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
</style>
