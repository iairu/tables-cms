<script>
  import { onMount } from 'svelte';
  import { cmsData } from '../../../stores/cmsData.js';
  import { saveBiometricRows } from '../../../stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from '../../../stores/loading.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  import AssetManagerModal from '../AssetManagerModal.svelte';

  let cmsDataValue;
  let biometricRows = [];
  let isLoadingValue;
  let searchQuery = '';
  let selectedRecord = null;
  let isEditing = false;
  let showConfirmDelete = false;
  let recordToDelete = null;
  let showAssetManager = false;
  let activeImageField = null;

  // Form data
  let formData = {
    id: '',
    firstName: '',
    lastName: '',
    middleNames: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    skinColor: '',
    bloodType: '',
    rhFactor: '',
    nationalId: '',
    socialSecurity: '',
    passportNumber: '',
    driversLicense: '',
    marriageStatus: '',
    spouseName: '',
    children: '',
    fingerprints: {
      leftThumb: '',
      rightThumb: '',
      leftPalm: '',
      rightPalm: ''
    },
    faceImages: {
      front: '',
      back: '',
      leftSide: '',
      rightSide: ''
    },
    notes: ''
  };

  const genders = ['Male', 'Female', 'Other'];
  const bloodTypes = ['A', 'B', 'AB', 'O'];
  const rhFactors = ['+', '-'];
  const marriageStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];

  const unsubscribeCms = cmsData.subscribe(value => {
    cmsDataValue = value;
    biometricRows = value.biometricRows || [];
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
      middleNames: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: '',
      height: '',
      weight: '',
      eyeColor: '',
      hairColor: '',
      skinColor: '',
      bloodType: '',
      rhFactor: '',
      nationalId: '',
      socialSecurity: '',
      passportNumber: '',
      driversLicense: '',
      marriageStatus: '',
      spouseName: '',
      children: '',
      fingerprints: {
        leftThumb: '',
        rightThumb: '',
        leftPalm: '',
        rightPalm: ''
      },
      faceImages: {
        front: '',
        back: '',
        leftSide: '',
        rightSide: ''
      },
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
      updatedRows = biometricRows.map(record =>
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
      updatedRows = [...biometricRows, newRecord];
    }

    saveBiometricRows(updatedRows);
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
      const updatedRows = biometricRows.filter(record => record.id !== recordToDelete.id);
      saveBiometricRows(updatedRows);
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

  function selectImage(url) {
    if (activeImageField) {
      const [category, field] = activeImageField.split('.');
      if (category === 'fingerprints') {
        formData.fingerprints = { ...formData.fingerprints, [field]: url };
      } else if (category === 'faceImages') {
        formData.faceImages = { ...formData.faceImages, [field]: url };
      }
    }
    showAssetManager = false;
    activeImageField = null;
  }

  function openAssetManager(category, field) {
    activeImageField = `${category}.${field}`;
    showAssetManager = true;
  }

  function matchesSearch(record) {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fields = [
      record.firstName,
      record.lastName,
      record.nationalId,
      record.socialSecurity,
      record.passportNumber
    ];

    return fields.some(field =>
      field && field.toLowerCase().includes(query)
    );
  }

  const filteredRecords = biometricRows.filter(matchesSearch);
</script>

<div class="biometric-section">
  <div class="warning-banner">
    <i class="fas fa-exclamation-triangle"></i>
    <div>
      <strong>⚠️ Demo Only - Not Secure</strong>
      <p>This extension is for demonstration purposes only. Data is stored unencrypted and should NOT be used for actual sensitive biometric information.</p>
    </div>
  </div>

  <div class="section-header">
    <h2><i class="fas fa-fingerprint"></i> Biometric Records</h2>
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
            {#if record.dateOfBirth}
              <span><i class="fas fa-birthday-cake"></i> DOB: {record.dateOfBirth}</span>
            {/if}
            {#if record.nationalId}
              <span><i class="fas fa-id-card"></i> ID: {record.nationalId}</span>
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
      <h3>{isEditing ? 'Edit Record' : 'New Biometric Record'}</h3>

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
            <label>Middle Names</label>
            <input type="text" bind:value={formData.middleNames} />
          </div>
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" bind:value={formData.dateOfBirth} />
          </div>
          <div class="form-group">
            <label>Place of Birth</label>
            <input type="text" bind:value={formData.placeOfBirth} />
          </div>
          <div class="form-group">
            <label>Gender</label>
            <select bind:value={formData.gender}>
              <option value="">Select Gender</option>
              {#each genders as gender}
                <option value={gender}>{gender}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-heartbeat"></i> Physical Characteristics</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Height (cm)</label>
            <input type="number" bind:value={formData.height} placeholder="e.g., 175" />
          </div>
          <div class="form-group">
            <label>Weight (kg)</label>
            <input type="number" bind:value={formData.weight} placeholder="e.g., 70" />
          </div>
          <div class="form-group">
            <label>Eye Color</label>
            <input type="text" bind:value={formData.eyeColor} placeholder="e.g., Brown, Blue" />
          </div>
          <div class="form-group">
            <label>Hair Color</label>
            <input type="text" bind:value={formData.hairColor} placeholder="e.g., Black, Blonde" />
          </div>
          <div class="form-group">
            <label>Skin Color</label>
            <input type="text" bind:value={formData.skinColor} />
          </div>
          <div class="form-group">
            <label>Blood Type</label>
            <select bind:value={formData.bloodType}>
              <option value="">Select Blood Type</option>
              {#each bloodTypes as type}
                <option value={type}>{type}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Rh Factor</label>
            <select bind:value={formData.rhFactor}>
              <option value="">Select Rh Factor</option>
              {#each rhFactors as factor}
                <option value={factor}>{factor}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-id-card"></i> Identification Numbers</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>National ID Number</label>
            <input type="text" bind:value={formData.nationalId} />
          </div>
          <div class="form-group">
            <label>Social Security Number</label>
            <input type="text" bind:value={formData.socialSecurity} />
          </div>
          <div class="form-group">
            <label>Passport Number</label>
            <input type="text" bind:value={formData.passportNumber} />
          </div>
          <div class="form-group">
            <label>Driver's License Number</label>
            <input type="text" bind:value={formData.driversLicense} />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-ring"></i> Family Information</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Marriage Status</label>
            <select bind:value={formData.marriageStatus}>
              <option value="">Select Status</option>
              {#each marriageStatuses as status}
                <option value={status}>{status}</option>
              {/each}
            </select>
          </div>
          <div class="form-group">
            <label>Spouse Name</label>
            <input type="text" bind:value={formData.spouseName} />
          </div>
          <div class="form-group full-width">
            <label>Children</label>
            <input type="text" bind:value={formData.children} placeholder="Names of children" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-fingerprint"></i> Fingerprints</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Left Thumb</label>
            <div class="image-upload">
              {#if formData.fingerprints.leftThumb}
                <img class="image-preview" src={formData.fingerprints.leftThumb} alt="Left Thumb" />
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'leftThumb')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'leftThumb')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
          <div class="form-group">
            <label>Right Thumb</label>
            <div class="image-upload">
              {#if formData.fingerprints.rightThumb}
                <img class="image-preview" src={formData.fingerprints.rightThumb} alt="Right Thumb" />
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'rightThumb')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'rightThumb')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
          <div class="form-group">
            <label>Left Palm</label>
            <div class="image-upload">
              {#if formData.fingerprints.leftPalm}
                <img class="image-preview" src={formData.fingerprints.leftPalm} alt="Left Palm" />
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'leftPalm')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'leftPalm')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
          <div class="form-group">
            <label>Right Palm</label>
            <div class="image-upload">
              {#if formData.fingerprints.rightPalm}
                <img class="image-preview" src={formData.fingerprints.rightPalm} alt="Right Palm" />
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'rightPalm')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('fingerprints', 'rightPalm')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-user-circle"></i> Face Images</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Front View</label>
            <div class="image-upload">
              {#if formData.faceImages.front}
                <img class="image-preview" src={formData.faceImages.front} alt="Front" />
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'front')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'front')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
          <div class="form-group">
            <label>Back View</label>
            <div class="image-upload">
              {#if formData.faceImages.back}
                <img class="image-preview" src={formData.faceImages.back} alt="Back" />
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'back')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'back')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
          <div class="form-group">
            <label>Left Side</label>
            <div class="image-upload">
              {#if formData.faceImages.leftSide}
                <img class="image-preview" src={formData.faceImages.leftSide} alt="Left Side" />
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'leftSide')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'leftSide')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
          <div class="form-group">
            <label>Right Side</label>
            <div class="image-upload">
              {#if formData.faceImages.rightSide}
                <img class="image-preview" src={formData.faceImages.rightSide} alt="Right Side" />
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'rightSide')}>Change</button>
              {:else}
                <button class="btn-secondary" on:click={() => openAssetManager('faceImages', 'rightSide')}>
                  <i class="fas fa-upload"></i> Upload
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h4><i class="fas fa-sticky-note"></i> Notes</h4>
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
    title="Delete Biometric Record"
    message="Are you sure you want to delete this record? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />

  <AssetManagerModal
    isOpen={showAssetManager}
    onSelect={selectImage}
    onClose={() => showAssetManager = false}
  />
</div>

<style>
  .biometric-section {
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

  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .image-preview {
    width: 100%;
    max-width: 200px;
    height: 150px;
    object-fit: cover;
    border-radius: var(--radius-md);
    border: 2px solid var(--border-light);
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
