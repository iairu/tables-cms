<script>
  import { onMount } from 'svelte';
  import { cmsData } from '../../../stores/cmsData.js';
  import { saveCatRows } from '../../../stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from '../../../stores/loading.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  import AssetManagerModal from '../AssetManagerModal.svelte';

  let cmsDataValue;
  let catRows = [];
  let isLoadingValue;
  let searchQuery = '';
  let selectedCat = null;
  let isEditing = false;
  let showConfirmDelete = false;
  let catToDelete = null;
  let showAssetManager = false;
  let viewMode = 'table'; // 'table' or 'tree'
  let selectedCatForTree = null;
  let showFamilyTree = false;
  let showDescendantsTree = false;

  // Form data
  let formData = {
    id: '',
    titleBefore: '',
    fullName: '',
    titleAfter: '',
    emsColor: '',
    breed: '',
    gender: 'F', // M or F
    dateOfBirth: '',
    geneticTests: '',
    breedingStation: '',
    countryCode: '',
    altNames: '',
    printNameLines: '',
    regNo: '',
    regNo2: '',
    regNo3: '',
    breeder: '',
    owner: '',
    countryOfOrigin: '',
    countryOfResidence: '',
    ownershipNotes: '',
    personalInfo: '',
    ownershipChangeDate: '',
    sireId: '',
    damId: '',
    photoUrl: ''
  };

  // Breed list (FIFe recognized breeds - sample)
  const breeds = [
    'Abyssinian', 'American Curl', 'American Shorthair', 'American Wirehair',
    'Balinese', 'Bengal', 'Birman', 'Bombay', 'British Longhair', 'British Shorthair',
    'Burmese', 'Burmilla', 'Chartreux', 'Colorpoint Shorthair', 'Cornish Rex',
    'Devon Rex', 'Egyptian Mau', 'European Burmese', 'Exotic Shorthair',
    'Havana Brown', 'Himalayan', 'Japanese Bobtail', 'Javanese', 'Korat',
    'LaPerm', 'Maine Coon', 'Manx', 'Munchkin', 'Nebelung', 'Norwegian Forest Cat',
    'Ocicat', 'Oriental', 'Persian', 'Ragdoll', 'Russian Blue', 'Savannah',
    'Scottish Fold', 'Selkirk Rex', 'Siamese', 'Siberian', 'Singapura', 'Somali',
    'Sphynx', 'Tonkinese', 'Turkish Angora', 'Turkish Van'
  ];

  // EMS Color codes (sample)
  const emsColors = [
    'n - Black', 'a - Blue', 'b - Chocolate', 'c - Lilac',
    'd - Red', 'e - Cream', 'f - Black Tortie', 'g - Blue Tortie',
    'h - Chocolate Tortie', 'j - Lilac Tortie', 's - Silver', 'w - White',
    'x - Unrecognized', 'y - Cinnamon', 'z - Fawn'
  ];

  // Country codes (sample)
  const countryCodes = [
    'US - United States', 'GB - United Kingdom', 'DE - Germany', 'FR - France',
    'IT - Italy', 'ES - Spain', 'NL - Netherlands', 'BE - Belgium',
    'CH - Switzerland', 'AT - Austria', 'SE - Sweden', 'NO - Norway',
    'DK - Denmark', 'FI - Finland', 'PL - Poland', 'CZ - Czech Republic',
    'AU - Australia', 'NZ - New Zealand', 'CA - Canada', 'JP - Japan',
    'CN - China', 'BR - Brazil', 'RU - Russia', 'ZA - South Africa'
  ];

  const unsubscribeCms = cmsData.subscribe(value => {
    cmsDataValue = value;
    catRows = value.catRows || [];
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
      titleBefore: '',
      fullName: '',
      titleAfter: '',
      emsColor: '',
      breed: '',
      gender: 'F',
      dateOfBirth: '',
      geneticTests: '',
      breedingStation: '',
      countryCode: '',
      altNames: '',
      printNameLines: '',
      regNo: '',
      regNo2: '',
      regNo3: '',
      breeder: '',
      owner: '',
      countryOfOrigin: '',
      countryOfResidence: '',
      ownershipNotes: '',
      personalInfo: '',
      ownershipChangeDate: '',
      sireId: '',
      damId: '',
      photoUrl: ''
    };
  }

  function openNewCat() {
    resetForm();
    isEditing = false;
    selectedCat = null;
  }

  function editCat(cat) {
    formData = { ...cat };
    isEditing = true;
    selectedCat = cat;
  }

  function saveCat() {
    if (!formData.fullName) {
      alert('Full name is required');
      return;
    }

    const now = Date.now();
    let updatedRows;

    if (isEditing && selectedCat) {
      // Update existing cat
      updatedRows = catRows.map(cat =>
        cat.id === formData.id
          ? { ...formData, updatedAt: now }
          : cat
      );
    } else {
      // Add new cat
      const newCat = {
        ...formData,
        id: now.toString(),
        createdAt: now,
        updatedAt: now
      };
      updatedRows = [...catRows, newCat];
    }

    saveCatRows(updatedRows);
    resetForm();
    isEditing = false;
    selectedCat = null;
  }

  function deleteCat(cat) {
    catToDelete = cat;
    showConfirmDelete = true;
  }

  async function confirmDelete() {
    if (catToDelete) {
      const updatedRows = catRows.filter(cat => cat.id !== catToDelete.id);
      saveCatRows(updatedRows);
      resetForm();
      isEditing = false;
      selectedCat = null;
      showConfirmDelete = false;
      catToDelete = null;
    }
  }

  function cancelDelete() {
    showConfirmDelete = false;
    catToDelete = null;
  }

  function selectPhoto(url) {
    formData.photoUrl = url;
    showAssetManager = false;
  }

  function viewFamilyTree(cat) {
    selectedCatForTree = cat;
    showFamilyTree = true;
  }

  function viewDescendantsTree(cat) {
    selectedCatForTree = cat;
    showDescendantsTree = true;
  }

  function closeFamilyTree() {
    showFamilyTree = false;
    selectedCatForTree = null;
  }

  function closeDescendantsTree() {
    showDescendantsTree = false;
    selectedCatForTree = null;
  }

  // Get sire and dam details
  function getSire(cat) {
    if (!cat.sireId) return null;
    return catRows.find(c => c.id === cat.sireId);
  }

  function getDam(cat) {
    if (!cat.damId) return null;
    return catRows.find(c => c.id === cat.damId);
  }

  // Build family tree recursively
  function buildFamilyTree(cat, generation = 0) {
    if (generation >= 4) return null; // Limit to 4 generations

    const node = {
      ...cat,
      generation,
      sire: cat.sireId ? buildFamilyTree(getSire(cat), generation + 1) : null,
      dam: cat.damId ? buildFamilyTree(getDam(cat), generation + 1) : null
    };

    return node;
  }

  // Build descendants tree recursively
  function buildDescendantsTree(cat, generation = 0) {
    if (generation >= 4) return null;

    const children = catRows.filter(c => c.sireId === cat.id || c.damId === cat.id);
    const node = {
      ...cat,
      generation,
      children: children.map(child => buildDescendantsTree(child, generation + 1))
    };

    return node;
  }

  // Duplicate detection
  function findDuplicates() {
    const duplicates = [];
    const nameMap = new Map();

    catRows.forEach(cat => {
      const name = cat.fullName.toLowerCase();
      if (nameMap.has(name)) {
        duplicates.push({ name, cats: nameMap.get(name) });
        nameMap.get(name).push(cat);
      } else {
        nameMap.set(name, [cat]);
      }
    });

    return duplicates.filter(d => d.cats.length > 1);
  }

  // Fuzzy search
  function matchesSearch(cat) {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fields = [
      cat.fullName,
      cat.titleBefore,
      cat.titleAfter,
      cat.breed,
      cat.emsColor,
      cat.regNo,
      cat.breeder,
      cat.owner
    ];

    return fields.some(field =>
      field && field.toLowerCase().includes(query)
    );
  }

  const filteredCats = catRows.filter(matchesSearch);
  const duplicates = findDuplicates();
</script>

<div class="cats-section">
  <div class="section-header">
    <h2><i class="fas fa-paw"></i> Pedigree (Cats)</h2>
    <div class="header-actions">
      <input
        type="text"
        class="search-input"
        placeholder="Search cats..."
        bind:value={searchQuery}
      />
      <button class="btn-secondary" on:click={() => viewMode = viewMode === 'table' ? 'tree' : 'table'}>
        <i class="fas fa-{viewMode === 'table' ? 'project-diagram' : 'table'}"></i>
        {viewMode === 'table' ? 'Tree View' : 'Table View'}
      </button>
      <button class="btn-primary" on:click={openNewCat}>
        <i class="fas fa-plus"></i>
        New Cat
      </button>
    </div>
  </div>

  {#if duplicates.length > 0}
    <div class="duplicates-warning">
      <i class="fas fa-exclamation-triangle"></i>
      <span>Found {duplicates.length} duplicate name(s)</span>
    </div>
  {/if}

  {#if viewMode === 'table'}
    <div class="cats-table-container">
      <table class="cats-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Breed</th>
            <th>Gender</th>
            <th>Date of Birth</th>
            <th>EMS Color</th>
            <th>Registration #</th>
            <th>Breeder</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredCats as cat (cat.id)}
            <tr class:selected={selectedCat?.id === cat.id} on:click={() => editCat(cat)}>
              <td>
                {cat.titleBefore} {cat.fullName} {cat.titleAfter}
                {#if cat.photoUrl}
                  <img class="cat-photo-thumb" src={cat.photoUrl} alt={cat.fullName} />
                {/if}
              </td>
              <td>{cat.breed}</td>
              <td>
                <i class="fas fa-{cat.gender === 'M' ? 'mars' : 'venus'}"></i>
                {cat.gender === 'M' ? 'Male' : 'Female'}
              </td>
              <td>{cat.dateOfBirth}</td>
              <td>{cat.emsColor}</td>
              <td>{cat.regNo}</td>
              <td>{cat.breeder}</td>
              <td class="actions">
                <button
                  class="btn-icon"
                  title="View Family Tree"
                  on:click|stopPropagation={() => viewFamilyTree(cat)}
                >
                  <i class="fas fa-sitemap"></i>
                </button>
                <button
                  class="btn-icon"
                  title="View Descendants"
                  on:click|stopPropagation={() => viewDescendantsTree(cat)}
                >
                  <i class="fas fa-project-diagram"></i>
                </button>
                <button
                  class="btn-icon btn-danger"
                  title="Delete"
                  on:click|stopPropagation={() => deleteCat(cat)}
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="cats-tree-container">
      {#if selectedCatForTree}
        <div class="tree-view">
          <h3>Family Tree: {selectedCatForTree.fullName}</h3>
          <pre>{JSON.stringify(buildFamilyTree(selectedCatForTree), null, 2)}</pre>
        </div>
      {:else}
        <p class="no-selection">Select a cat to view family tree</p>
      {/if}
    </div>
  {/if}

  {#if isEditing || !selectedCat}
    <div class="cat-editor">
      <h3>{isEditing ? 'Edit Cat' : 'New Cat'}</h3>

      <div class="form-grid">
        <div class="form-group">
          <label>Title Before Name</label>
          <input type="text" bind:value={formData.titleBefore} placeholder="e.g., CH, GC" />
        </div>

        <div class="form-group full-width">
          <label>Full Name *</label>
          <input type="text" bind:value={formData.fullName} placeholder="Required" required />
        </div>

        <div class="form-group">
          <label>Title After Name</label>
          <input type="text" bind:value={formData.titleAfter} placeholder="e.g., DVM" />
        </div>

        <div class="form-group">
          <label>Breed</label>
          <select bind:value={formData.breed}>
            <option value="">Select Breed</option>
            {#each breeds as breed}
              <option value={breed}>{breed}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Gender</label>
          <div class="radio-group">
            <label>
              <input type="radio" name="gender" value="F" bind:group={formData.gender} />
              Female
            </label>
            <label>
              <input type="radio" name="gender" value="M" bind:group={formData.gender} />
              Male
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Date of Birth</label>
          <input type="date" bind:value={formData.dateOfBirth} />
        </div>

        <div class="form-group">
          <label>EMS Color</label>
          <select bind:value={formData.emsColor}>
            <option value="">Select Color</option>
            {#each emsColors as color}
              <option value={color}>{color}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Country Code</label>
          <select bind:value={formData.countryCode}>
            <option value="">Select Country</option>
            {#each countryCodes as code}
              <option value={code}>{code}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Registration Number</label>
          <input type="text" bind:value={formData.regNo} placeholder="Primary reg. no." />
        </div>

        <div class="form-group">
          <label>Registration Number 2</label>
          <input type="text" bind:value={formData.regNo2} />
        </div>

        <div class="form-group">
          <label>Registration Number 3</label>
          <input type="text" bind:value={formData.regNo3} />
        </div>

        <div class="form-group">
          <label>Breeding Station</label>
          <input type="text" bind:value={formData.breedingStation} />
        </div>

        <div class="form-group">
          <label>Genetic Tests</label>
          <input type="text" bind:value={formData.geneticTests} placeholder="e.g., PKD-, HCM-" />
        </div>

        <div class="form-group full-width">
          <label>Alternative Names</label>
          <input type="text" bind:value={formData.altNames} placeholder="Comma separated" />
        </div>

        <div class="form-group full-width">
          <label>Print Name Lines</label>
          <input type="text" bind:value={formData.printNameLines} />
        </div>

        <div class="form-group">
          <label>Breeder</label>
          <input type="text" bind:value={formData.breeder} />
        </div>

        <div class="form-group">
          <label>Owner</label>
          <input type="text" bind:value={formData.owner} />
        </div>

        <div class="form-group">
          <label>Country of Origin</label>
          <input type="text" bind:value={formData.countryOfOrigin} />
        </div>

        <div class="form-group">
          <label>Country of Residence</label>
          <input type="text" bind:value={formData.countryOfResidence} />
        </div>

        <div class="form-group">
          <label>Sire (Father)</label>
          <select bind:value={formData.sireId}>
            <option value="">Select Sire</option>
            {#each catRows.filter(c => c.gender === 'M') as sire (sire.id)}
              <option value={sire.id}>{sire.fullName}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Dam (Mother)</label>
          <select bind:value={formData.damId}>
            <option value="">Select Dam</option>
            {#each catRows.filter(c => c.gender === 'F') as dam (dam.id)}
              <option value={dam.id}>{dam.fullName}</option>
            {/each}
          </select>
        </div>

        <div class="form-group full-width">
          <label>Photo</label>
          <div class="photo-upload">
            {#if formData.photoUrl}
              <img class="photo-preview" src={formData.photoUrl} alt="Cat photo" />
              <button class="btn-secondary" on:click={() => showAssetManager = true}>
                Change Photo
              </button>
            {:else}
              <button class="btn-secondary" on:click={() => showAssetManager = true}>
                <i class="fas fa-upload"></i>
                Upload Photo
              </button>
            {/if}
          </div>
        </div>

        <div class="form-group full-width">
          <label>Ownership Notes</label>
          <textarea bind:value={formData.ownershipNotes} rows="3"></textarea>
        </div>

        <div class="form-group full-width">
          <label>Personal Info</label>
          <textarea bind:value={formData.personalInfo} rows="3"></textarea>
        </div>

        <div class="form-group">
          <label>Ownership Change Date</label>
          <input type="date" bind:value={formData.ownershipChangeDate} />
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-secondary" on:click={resetForm}>
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn-primary" on:click={saveCat}>
          <i class="fas fa-save"></i>
          {isEditing ? 'Update' : 'Create'} Cat
        </button>
      </div>
    </div>
  {/if}

  <ConfirmModal
    isOpen={showConfirmDelete}
    title="Delete Cat"
    message="Are you sure you want to delete '{catToDelete?.fullName}'? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />

  <AssetManagerModal
    isOpen={showAssetManager}
    onSelect={selectPhoto}
    onClose={() => showAssetManager = false}
  />

  {#if showFamilyTree}
    <div class="modal-overlay" on:click={closeFamilyTree}>
      <div class="modal-large" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Family Tree: {selectedCatForTree?.fullName}</h3>
          <button class="btn-icon" on:click={closeFamilyTree}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="family-tree">
            {#if selectedCatForTree}
              {@const tree = buildFamilyTree(selectedCatForTree)}
              <div class="tree-node">
                <div class="cat-card">
                  <strong>{selectedCatForTree.fullName}</strong>
                  <p>{selectedCatForTree.breed}</p>
                </div>
                <div class="parents">
                  {#if tree?.sire}
                    <div class="parent">
                      <div class="cat-card sire">
                        <strong>{tree.sire.fullName}</strong>
                        <p>Sire (Father)</p>
                      </div>
                    </div>
                  {/if}
                  {#if tree?.dam}
                    <div class="parent">
                      <div class="cat-card dam">
                        <strong>{tree.dam.fullName}</strong>
                        <p>Dam (Mother)</p>
                      </div>
                    </div>
                  {/if}
                </div>
                {#if tree?.sire?.sire || tree?.sire?.dam}
                  <div class="grandparents">
                    <h4>Paternal Grandparents</h4>
                    <div class="parents">
                      {#if tree.sire.sire}
                        <div class="cat-card">{tree.sire.sire.fullName}</div>
                      {/if}
                      {#if tree.sire.dam}
                        <div class="cat-card">{tree.sire.dam.fullName}</div>
                      {/if}
                    </div>
                  </div>
                {/if}
                {#if tree?.dam?.sire || tree?.dam?.dam}
                  <div class="grandparents">
                    <h4>Maternal Grandparents</h4>
                    <div class="parents">
                      {#if tree.dam.sire}
                        <div class="cat-card">{tree.dam.sire.fullName}</div>
                      {/if}
                      {#if tree.dam.dam}
                        <div class="cat-card">{tree.dam.dam.fullName}</div>
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showDescendantsTree}
    <div class="modal-overlay" on:click={closeDescendantsTree}>
      <div class="modal-large" on:click|stopPropagation>
        <div class="modal-header">
          <h3>Descendants: {selectedCatForTree?.fullName}</h3>
          <button class="btn-icon" on:click={closeDescendantsTree}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="descendants-tree">
            {#if selectedCatForTree}
              {@const tree = buildDescendantsTree(selectedCatForTree)}
              <div class="tree-node">
                <div class="cat-card root">
                  <strong>{selectedCatForTree.fullName}</strong>
                  <p>Root</p>
                </div>
                {#if tree?.children && tree.children.length > 0}
                  <div class="children">
                    {#each tree.children as child (child.id)}
                      <div class="cat-card child">
                        <strong>{child.fullName}</strong>
                        <p>{child.gender === 'M' ? 'Son' : 'Daughter'}</p>
                      </div>
                    {/each}
                  </div>
                {:else}
                  <p class="no-children">No descendants found</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .cats-section {
    padding: 20px;
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

  .duplicates-warning {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-md);
    padding: 12px 16px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--color-accent);
  }

  .cats-table-container {
    overflow-x: auto;
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
  }

  .cats-table {
    width: 100%;
    border-collapse: collapse;
  }

  .cats-table th,
  .cats-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
  }

  .cats-table th {
    background: var(--bg-tertiary);
    font-weight: 600;
    color: var(--text-secondary);
  }

  .cats-table tbody tr:hover {
    background: var(--bg-secondary);
    cursor: pointer;
  }

  .cats-table tbody tr.selected {
    background: rgba(37, 99, 235, 0.1);
  }

  .cat-photo-thumb {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: var(--radius-md);
    margin-left: 8px;
    vertical-align: middle;
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .cat-editor {
    margin-top: 20px;
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 24px;
    box-shadow: var(--shadow-md);
  }

  .cat-editor h3 {
    margin-bottom: 20px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
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

  .radio-group {
    display: flex;
    gap: 16px;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: normal;
    cursor: pointer;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .photo-upload {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .photo-preview {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: var(--radius-lg);
    border: 2px solid var(--border-light);
  }

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
  }

  .modal-large {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .modal-header h3 {
    margin: 0;
  }

  .modal-body {
    padding: 20px;
  }

  .family-tree,
  .descendants-tree {
    padding: 20px;
  }

  .tree-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .cat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 12px;
    min-width: 200px;
    text-align: center;
  }

  .cat-card strong {
    display: block;
    margin-bottom: 6px;
    color: var(--text-primary);
  }

  .cat-card p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .cat-card.sire {
    border-left: 3px solid var(--color-primary);
  }

  .cat-card.dam {
    border-right: 3px solid var(--color-secondary);
  }

  .parents {
    display: flex;
    gap: 40px;
    justify-content: center;
  }

  .grandparents {
    width: 100%;
    text-align: center;
  }

  .grandparents h4 {
    margin: 20px 0 10px;
    color: var(--text-secondary);
  }

  .children {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
  }

  .no-children,
  .no-selection {
    text-align: center;
    color: var(--text-tertiary);
    padding: 40px;
  }
</style>
