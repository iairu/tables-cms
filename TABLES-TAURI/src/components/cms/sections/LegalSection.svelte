<script>
  import { onMount } from 'svelte';
  import { cmsData } from '../../../stores/cmsData.js';
  import { saveLegalRows } from '../../../stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from '../../../stores/loading.js';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  let legalRows = [];
  let isLoadingValue;
  let searchQuery = '';
  let selectedRecord = null;
  let isEditing = false;
  let showConfirmDelete = false;
  let recordToDelete = null;

  // Form data
  let formData = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationalId: '',
    caseNumber: '',
    caseType: '',
    courtName: '',
    filingDate: '',
    caseStatus: '',
    charges: '',
    defenseAttorney: '',
    defensePhone: '',
    prosecutor: '',
    prosecutorPhone: '',
    judge: '',
    courtDates: '',
    bailAmount: '',
    sentencing: '',
    appeals: '',
    legalNotes: '',
    documents: '',
    notes: ''
  };

  const caseTypes = ['Criminal', 'Civil', 'Family', 'Traffic', 'Juvenile', 'Other'];
  const caseStatuses = ['Pending', 'Active', 'Closed', 'Dismissed', 'Appealed', 'Other'];

  const unsubscribeCms = cmsData.subscribe(value => {
    cmsDataValue = value;
    legalRows = value.legalRows || [];
  });

  const unsubscribeLoading = isLoading.subscribe(value => isLoadingValue = value);

  onMount(() => {
    showLoading();
    setTimeout(() => {
      hideLoading();
    }, 500);
  });

  function resetForm() {
    formData = {
      id: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationalId: '',
      caseNumber: '',
      caseType: '',
      courtName: '',
      filingDate: '',
      caseStatus: '',
      charges: '',
      defenseAttorney: '',
      defensePhone: '',
      prosecutor: '',
      prosecutorPhone: '',
      judge: '',
      courtDates: '',
      bailAmount: '',
      sentencing: '',
      appeals: '',
      legalNotes: '',
      documents: '',
      notes: ''
    };
  }

  function openNewRecord() {
    resetForm();
    isEditing = false;
    selectedRecord = null;
  }

  function editRecord(record) {
    formData = { ...record };
    isEditing = true;
    selectedRecord = record;
  }

  function saveRecord() {
    if (!formData.firstName || !formData.lastName) {
      alert('First name and last name are required');
      return;
    }

    const now = Date.now();
    let updatedRows;

    if (isEditing && selectedRecord) {
      updatedRows = legalRows.map(record =>
        record.id === formData.id
          ? { ...formData, updatedAt: now }
          : record
      );
    } else {
      const newRecord = {
        ...formData,
        id: now.toString(),
        createdAt: now,
        updatedAt: now
      };
      updatedRows = [...legalRows, newRecord];
    }

    saveLegalRows(updatedRows);
    resetForm();
    isEditing = false;
    selectedRecord = null;
  }

  function deleteRecord(record) {
    recordToDelete = record;
    showConfirmDelete = true;
  }

  async function confirmDelete() {
    if (recordToDelete) {
      const updatedRows = legalRows.filter(record => record.id !== recordToDelete.id);
      saveLegalRows(updatedRows);
      resetForm();
      isEditing = false;
      selectedRecord = null;
      showConfirmDelete = false;
      recordToDelete = null;
    }
  }

  function cancelDelete() {
    showConfirmDelete = false;
    recordToDelete = null;
  }

  function matchesSearch(record) {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fields = [
      record.firstName,
      record.lastName,
      record.caseNumber,
      record.charges,
      record.defenseAttorney,
      record.courtName
    ];

    return fields.some(field =>
      field && field.toLowerCase().includes(query)
    );
  }

  const filteredRecords = legalRows.filter(matchesSearch);
</script>

<div class="legal-section">
  <div class="warning-banner">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <strong>⚠️ Demo Only - Not Secure</strong>
      <p>This extension is for demonstration purposes only. Data is stored unencrypted and should NOT be used for actual legal records.</p>
    </div>
  </div>

  <div class="section-header">
    <h2><i class="fas fa-gavel"></i> Legal Records</h2>
    <div class="header-actions">
      <input
        type="text"
        class="search-input"
        placeholder="Search records..."
        bind:value={searchQuery}
      />
      <button class="btn-primary" on:click={openNewRecord}>
        <i class="fas fa-plus"></i>
        New Record
      </button>
    </div>
  </div>

  <div class="records-grid">
    {#each filteredRecords.slice(0, 20) as record (record.id)}
      <div class="record-card" on:click={() => editRecord(record)}>
        <div class="record-info">
          <h3>{record.firstName} {record.lastName}</h3>
          <p class="record-meta">
            {#if record.caseNumber}
              <span><i class="fas fa-file-alt"></i> Case: {record.caseNumber}</span>
            {/if}
            {#if record.caseType}
              <span><i class="fas fa-balance-scale"></i> {record.caseType}</span>
            {/if}
          </p>
        </div>
        <div class="record-actions">
          <button
            class="btn-icon btn-danger"
            title="Delete"
            on:click|stopPropagation={() => deleteRecord(record)}
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    {/each}
  </div>

  {#if isEditing || !selectedRecord}
    <div class="record-editor">
      <h3>{isEditing ? 'Edit Record' : 'New Legal Record'}</h3>

      <div class="form-section">
        <h4><i class="fas fa-user"></i> Personal Information</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>First Name *</label>
            <input type="text" bind:value={formData.firstName} placeholder="Required" required />
          </div>
          <div class="form-group">
            <label>Last Name *</label>
            <input type="text" bind:value={formData.lastName} placeholder="Required" required />
          </div>
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" bind:value={formData.dateOfBirth} />
          </div>
          <div class="form-group">
            <label>National ID Number</label>
            <input type="text" bind:value={formData.nationalId} />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-gavel"></i> Case Information</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Case Number</label>
            <input type="text" bind:value={formData.caseNumber} />
          </div>
          <div class="form-group">
            <label>Case Type</label>
            <select bind:value={formData.caseType}>
              <option value="">Select Type</option>
              {#each caseTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Court Name</label>
            <input type="text" bind:value={formData.courtName} />
          </div>
          <div class="form-group">
            <label>Filing Date</label>
            <input type="date" bind:value={formData.filingDate} />
          </div>
          <div class="form-group">
            <label>Case Status</label>
            <select bind:value={formData.caseStatus}>
              <option value="">Select Status</option>
              {#each caseStatuses as status}
                <option value={status}>{status}</option>
              {/each}
            </select>
          </div>
          <div class="form-group full-width">
            <label>Charges / Claims</label>
            <textarea bind:value={formData.charges} rows="3" placeholder="List all charges or claims"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-user-tie"></i> Legal Representation</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Defense Attorney</label>
            <input type="text" bind:value={formData.defenseAttorney} />
          </div>
          <div class="form-group">
            <label>Defense Phone</label>
            <input type="tel" bind:value={formData.defensePhone} />
          </div>
          <div class="form-group">
            <label>Prosecutor</label>
            <input type="text" bind:value={formData.prosecutor} />
          </div>
          <div class="form-group">
            <label>Prosecutor Phone</label>
            <input type="tel" bind:value={formData.prosecutorPhone} />
          </div>
          <div class="form-group">
            <label>Judge</label>
            <input type="text" bind:value={formData.judge} />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-calendar-alt"></i> Court Proceedings</h4>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Court Dates</label>
            <textarea bind:value={formData.courtDates} rows="3" placeholder="List of court dates and outcomes"></textarea>
          </div>
          <div class="form-group">
            <label>Bail Amount</label>
            <input type="text" bind:value={formData.bailAmount} placeholder="e.g., $10,000" />
          </div>
          <div class="form-group full-width">
            <label>Sentencing</label>
            <textarea bind:value={formData.sentencing} rows="2" placeholder="Sentencing details if applicable"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Appeals</label>
            <textarea bind:value={formData.appeals} rows="2" placeholder="Appeal history if applicable"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-folder-open"></i> Documentation</h4>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Legal Notes</label>
            <textarea bind:value={formData.legalNotes} rows="3" placeholder="Case notes and observations"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Documents Reference</label>
            <textarea bind:value={formData.documents} rows="3" placeholder="List of related documents and their locations"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-sticky-note"></i> Additional Notes</h4>
        <div class="form-group full-width">
          <textarea bind:value={formData.notes} rows="4" placeholder="Additional notes"></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-secondary" on:click={resetForm}>
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn-primary" on:click={saveRecord}>
          <i class="fas fa-save"></i>
          {isEditing ? 'Update' : 'Create'} Record
        </button>
      </div>
    </div>
  {/if}

  <ConfirmModal
    isOpen={showConfirmDelete}
    title="Delete Legal Record"
    message="Are you sure you want to delete this record? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
</div>

<style>
  .legal-section {
    padding: 20px;
  }

  .warning-banner {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid #ef4444;
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .warning-banner i {
    color: #ef4444;
    font-size: 24px;
  }

  .warning-banner strong {
    color: #ef4444;
    display: block;
    margin-bottom: 4px;
  }

  .warning-banner p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .section-header h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }

  .section-header h2 i {
    color: var(--color-primary);
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-input {
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    min-width: 250px;
  }

  .records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .record-card {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 20px;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
    cursor: pointer;
    position: relative;
  }

  .record-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .record-info h3 {
    margin: 0 0 8px;
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  .record-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .record-meta span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .record-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .record-card:hover .record-actions {
    opacity: 1;
  }

  .record-editor {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 24px;
    box-shadow: var(--shadow-md);
  }

  .record-editor h3 {
    margin-bottom: 20px;
  }

  .form-section {
    margin-bottom: 24px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-light);
  }

  .form-section:last-of-type {
    border-bottom: none;
  }

  .form-section h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    color: var(--text-secondary);
  }

  .form-section h4 i {
    color: var(--color-primary);
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }

  .form-group label {
    margin-bottom: 6px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background: var(--border-medium);
  }

  .btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--text-secondary);
  }

  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }
</style>
