<script>
  import { onMount } from 'svelte';
  import { cmsData } from '../../../stores/cmsData.js';
  import { saveFinancialRows } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  let financialRows = [];
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
    socialSecurity: '',
    employmentStatus: '',
    employer: '',
    occupation: '',
    annualIncome: '',
    otherIncome: '',
    totalAssets: '',
    bankAccounts: '',
    investments: '',
    realEstate: '',
    vehicles: '',
    liabilities: '',
    loans: '',
    creditCards: '',
    mortgages: '',
    creditScore: '',
    monthlyExpenses: '',
    financialGoals: '',
    notes: ''
  };

  const employmentStatuses = ['Employed', 'Self-employed', 'Unemployed', 'Retired', 'Student', 'Other'];

  const unsubscribeCms = cmsData.subscribe(value => {
    cmsDataValue = value;
    financialRows = value.financialRows || [];
  });

  onMount(() => {
    return () => {
      unsubscribeCms();
    };
  });

  function resetForm() {
    formData = {
      id: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      socialSecurity: '',
      employmentStatus: '',
      employer: '',
      occupation: '',
      annualIncome: '',
      otherIncome: '',
      totalAssets: '',
      bankAccounts: '',
      investments: '',
      realEstate: '',
      vehicles: '',
      liabilities: '',
      loans: '',
      creditCards: '',
      mortgages: '',
      creditScore: '',
      monthlyExpenses: '',
      financialGoals: '',
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
      updatedRows = financialRows.map(record =>
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
      updatedRows = [...financialRows, newRecord];
    }

    saveFinancialRows(updatedRows);
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
      const updatedRows = financialRows.filter(record => record.id !== recordToDelete.id);
      saveFinancialRows(updatedRows);
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
      record.socialSecurity,
      record.employer,
      record.occupation
    ];

    return fields.some(field =>
      field && field.toLowerCase().includes(query)
    );
  }

  const filteredRecords = financialRows.filter(matchesSearch);
</script>

<div class="financial-section">
  <div class="warning-banner">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <strong>⚠️ Demo Only - Not Secure</strong>
      <p>This extension is for demonstration purposes only. Data is stored unencrypted and should NOT be used for actual financial records.</p>
    </div>
  </div>

  <div class="section-header">
    <h2><i class="fas fa-dollar-sign"></i> Financial Records</h2>
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
            {#if record.occupation}
              <span><i class="fas fa-briefcase"></i> {record.occupation}</span>
            {/if}
            {#if record.annualIncome}
              <span><i class="fas fa-dollar-sign"></i> {record.annualIncome}/year</span>
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
      <h3>{isEditing ? 'Edit Record' : 'New Financial Record'}</h3>

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
            <label>Social Security Number</label>
            <input type="text" bind:value={formData.socialSecurity} />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-briefcase"></i> Employment Information</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Employment Status</label>
            <select bind:value={formData.employmentStatus}>
              <option value="">Select Status</option>
              {#each employmentStatuses as status}
                <option value={status}>{status}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Employer</label>
            <input type="text" bind:value={formData.employer} />
          </div>
          <div class="form-group">
            <label>Occupation</label>
            <input type="text" bind:value={formData.occupation} />
          </div>
          <div class="form-group">
            <label>Annual Income</label>
            <input type="text" bind:value={formData.annualIncome} placeholder="e.g., $75,000" />
          </div>
          <div class="form-group full-width">
            <label>Other Income Sources</label>
            <textarea bind:value={formData.otherIncome} rows="2" placeholder="Additional income sources"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-piggy-bank"></i> Assets</h4>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Bank Accounts</label>
            <textarea bind:value={formData.bankAccounts} rows="2" placeholder="Bank names, account numbers, balances"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Investments</label>
            <textarea bind:value={formData.investments} rows="2" placeholder="Stocks, bonds, retirement accounts"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Real Estate</label>
            <textarea bind:value={formData.realEstate} rows="2" placeholder="Property addresses, values"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Vehicles</label>
            <textarea bind:value={formData.vehicles} rows="2" placeholder="Make, model, year, value"></textarea>
          </div>
          <div class="form-group">
            <label>Total Assets Estimate</label>
            <input type="text" bind:value={formData.totalAssets} placeholder="e.g., $500,000" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-file-invoice-dollar"></i> Liabilities</h4>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Loans</label>
            <textarea bind:value={formData.loans} rows="2" placeholder="Personal loans, car loans, balances"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Credit Cards</label>
            <textarea bind:value={formData.creditCards} rows="2" placeholder="Card names, limits, balances"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Mortgages</label>
            <textarea bind:value={formData.mortgages} rows="2" placeholder="Property addresses, balances"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Total Liabilities</label>
            <textarea bind:value={formData.liabilities} rows="2" placeholder="Summary of all debts"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-chart-line"></i> Financial Summary</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Credit Score</label>
            <input type="text" bind:value={formData.creditScore} placeholder="e.g., 750" />
          </div>
          <div class="form-group">
            <label>Monthly Expenses</label>
            <input type="text" bind:value={formData.monthlyExpenses} placeholder="e.g., $3,500" />
          </div>
          <div class="form-group full-width">
            <label>Financial Goals</label>
            <textarea bind:value={formData.financialGoals} rows="3" placeholder="Short-term and long-term financial goals"></textarea>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-sticky-note"></i> Additional Notes</h4>
        <div class="form-group full-width">
          <textarea bind:value={formData.notes} rows="4" placeholder="Additional financial notes"></textarea>
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
    title="Delete Financial Record"
    message="Are you sure you want to delete this record? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />
</div>

<style>
  .financial-section {
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

  .section-header, .records-grid, .record-card, .record-info, .record-meta, .record-actions,
  .record-editor, .form-section, .form-grid, .form-group, .form-actions, .btn, .btn-primary,
  .btn-secondary, .btn-icon {
    /* Reuse styles from MedicalSection */
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
