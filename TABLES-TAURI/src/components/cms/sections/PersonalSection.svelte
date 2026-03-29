<script>
  import { onMount } from 'svelte';
  import { cmsData } from '../../../stores/cmsData.js';
  import { saveUserRows } from '../../../stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from '../../../stores/loading.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  import AssetManagerModal from '../AssetManagerModal.svelte';

  let cmsDataValue;
  let userRows = [];
  let isLoadingValue;
  let searchQuery = '';
  let selectedUser = null;
  let isEditing = false;
  let showConfirmDelete = false;
  let userToDelete = null;
  let showAssetManager = false;

  // Form data
  let formData = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    occupation: '',
    relationshipStatus: '',
    pets: '',
    dietaryPreferences: '',
    travelHistory: '',
    emergencyContact: '',
    hobbies: '',
    interests: '',
    favoriteMusic: '',
    favoriteMovies: '',
    favoriteBooks: '',
    languagesSpoken: '',
    notes: '',
    photoUrl: ''
  };

  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];
  const relationshipStatuses = ['Single', 'In a relationship', 'Engaged', 'Married', 'Divorced', 'Widowed'];

  const unsubscribeCms = cmsData.subscribe(value => {
    cmsDataValue = value;
    userRows = value.userRows || [];
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
      gender: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      relationshipStatus: '',
      pets: '',
      dietaryPreferences: '',
      travelHistory: '',
      emergencyContact: '',
      hobbies: '',
      interests: '',
      favoriteMusic: '',
      favoriteMovies: '',
      favoriteBooks: '',
      languagesSpoken: '',
      notes: '',
      photoUrl: ''
    };
  }

  function openNewUser() {
    resetForm();
    isEditing = false;
    selectedUser = null;
  }

  function editUser(user) {
    formData = { ...user };
    isEditing = true;
    selectedUser = user;
  }

  function saveUser() {
    if (!formData.firstName || !formData.lastName) {
      alert('First name and last name are required');
      return;
    }

    const now = Date.now();
    let updatedRows;

    if (isEditing && selectedUser) {
      updatedRows = userRows.map(user =>
        user.id === formData.id
          ? { ...formData, updatedAt: now }
          : user
      );
    } else {
      const newUser = {
        ...formData,
        id: now.toString(),
        createdAt: now,
        updatedAt: now
      };
      updatedRows = [...userRows, newUser];
    }

    saveUserRows(updatedRows);
    resetForm();
    isEditing = false;
    selectedUser = null;
  }

  function deleteUser(user) {
    userToDelete = user;
    showConfirmDelete = true;
  }

  async function confirmDelete() {
    if (userToDelete) {
      const updatedRows = userRows.filter(user => user.id !== userToDelete.id);
      saveUserRows(updatedRows);
      resetForm();
      isEditing = false;
      selectedUser = null;
      showConfirmDelete = false;
      userToDelete = null;
    }
  }

  function cancelDelete() {
    showConfirmDelete = false;
    userToDelete = null;
  }

  function selectPhoto(url) {
    formData.photoUrl = url;
    showAssetManager = false;
  }

  function matchesSearch(user) {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.phone,
      user.occupation,
      user.hobbies,
      user.interests
    ];

    return fields.some(field =>
      field && field.toLowerCase().includes(query)
    );
  }

  const filteredUsers = userRows.filter(matchesSearch);

  function getAge(dateOfBirth) {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
</script>

<div class="personal-section">
  <div class="section-header">
    <h2><i class="fas fa-users"></i> Personal Records</h2>
    <div class="header-actions">
      <input
        type="text"
        class="search-input"
        placeholder="Search people..."
        bind:value={searchQuery}
      />
      <button class="btn-primary" on:click={openNewUser}>
        <i class="fas fa-plus"></i>
        New Person
      </button>
    </div>
  </div>

  <div class="users-grid">
    {#each filteredUsers.slice(0, 20) as user (user.id)}
      <div class="user-card" on:click={() => editUser(user)}>
        {#if user.photoUrl}
          <img class="user-photo" src={user.photoUrl} alt={user.firstName} />
        {:else}
          <div class="user-photo-placeholder">
            <i class="fas fa-user"></i>
          </div>
        {/if}
        <div class="user-info">
          <h3>{user.firstName} {user.lastName}</h3>
          <p class="user-email">{user.email}</p>
          <p class="user-meta">
            {#if user.dateOfBirth}
              <span><i class="fas fa-birthday-cake"></i> {getAge(user.dateOfBirth)} years</span>
            {/if}
            {#if user.occupation}
              <span><i class="fas fa-briefcase"></i> {user.occupation}</span>
            {/if}
          </p>
        </div>
        <div class="user-actions">
          <button
            class="btn-icon btn-danger"
            title="Delete"
            on:click|stopPropagation={() => deleteUser(user)}
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    {/each}
  </div>

  {#if filteredUsers.length > 20}
    <p class="showing-more">
      Showing 20 of {filteredUsers.length} results. Refine your search.
    </p>
  {/if}

  {#if isEditing || !selectedUser}
    <div class="user-editor">
      <h3>{isEditing ? 'Edit Person' : 'New Person'}</h3>

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
          <label>Gender</label>
          <select bind:value={formData.gender}>
            <option value="">Select Gender</option>
            {#each genders as gender}
              <option value={gender}>{gender}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input type="email" bind:value={formData.email} placeholder="email@example.com" />
        </div>

        <div class="form-group">
          <label>Phone</label>
          <input type="tel" bind:value={formData.phone} placeholder="+1 (555) 123-4567" />
        </div>

        <div class="form-group full-width">
          <label>Address</label>
          <input type="text" bind:value={formData.address} placeholder="Full address" />
        </div>

        <div class="form-group">
          <label>Occupation</label>
          <input type="text" bind:value={formData.occupation} />
        </div>

        <div class="form-group">
          <label>Relationship Status</label>
          <select bind:value={formData.relationshipStatus}>
            <option value="">Select Status</option>
            {#each relationshipStatuses as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
        </div>

        <div class="form-group full-width">
          <label>Pets</label>
          <input type="text" bind:value={formData.pets} placeholder="Pet names and types" />
        </div>

        <div class="form-group full-width">
          <label>Dietary Preferences</label>
          <input type="text" bind:value={formData.dietaryPreferences} placeholder="e.g., Vegetarian, Vegan, Gluten-free" />
        </div>

        <div class="form-group full-width">
          <label>Travel History</label>
          <textarea bind:value={formData.travelHistory} rows="2" placeholder="Countries visited, trips"></textarea>
        </div>

        <div class="form-group full-width">
          <label>Emergency Contact</label>
          <input type="text" bind:value={formData.emergencyContact} placeholder="Name and phone number" />
        </div>

        <div class="form-group full-width">
          <label>Hobbies</label>
          <input type="text" bind:value={formData.hobbies} placeholder="Comma separated" />
        </div>

        <div class="form-group full-width">
          <label>Interests</label>
          <input type="text" bind:value={formData.interests} placeholder="Comma separated" />
        </div>

        <div class="form-group full-width">
          <label>Favorite Music</label>
          <input type="text" bind:value={formData.favoriteMusic} placeholder="Artists, genres" />
        </div>

        <div class="form-group full-width">
          <label>Favorite Movies</label>
          <input type="text" bind:value={formData.favoriteMovies} placeholder="Movie titles" />
        </div>

        <div class="form-group full-width">
          <label>Favorite Books</label>
          <input type="text" bind:value={formData.favoriteBooks} placeholder="Book titles, authors" />
        </div>

        <div class="form-group full-width">
          <label>Languages Spoken</label>
          <input type="text" bind:value={formData.languagesSpoken} placeholder="Comma separated" />
        </div>

        <div class="form-group full-width">
          <label>Photo</label>
          <div class="photo-upload">
            {#if formData.photoUrl}
              <img class="photo-preview" src={formData.photoUrl} alt="Profile photo" />
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
          <label>Notes</label>
          <textarea bind:value={formData.notes} rows="4" placeholder="Additional notes"></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-secondary" on:click={resetForm}>
          <i class="fas fa-times"></i>
          Cancel
        </button>
        <button class="btn-primary" on:click={saveUser}>
          <i class="fas fa-save"></i>
          {isEditing ? 'Update' : 'Create'} Person
        </button>
      </div>
    </div>
  {/if}

  <ConfirmModal
    isOpen={showConfirmDelete}
    title="Delete Person"
    message="Are you sure you want to delete '{userToDelete?.firstName} {userToDelete?.lastName}'? This action cannot be undone."
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
</div>

<style>
  .personal-section {
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

  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .user-card {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 20px;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
    cursor: pointer;
    position: relative;
  }

  .user-card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .user-photo {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--radius-lg);
    margin-bottom: 16px;
  }

  .user-photo-placeholder {
    width: 100%;
    height: 200px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .user-photo-placeholder i {
    font-size: 80px;
    color: var(--text-muted);
  }

  .user-info h3 {
    margin: 0 0 8px;
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  .user-email {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin: 0 0 12px;
  }

  .user-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .user-meta span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .user-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .user-card:hover .user-actions {
    opacity: 1;
  }

  .showing-more {
    text-align: center;
    color: var(--text-tertiary);
    margin: 20px 0;
  }

  .user-editor {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 24px;
    box-shadow: var(--shadow-md);
  }

  .user-editor h3 {
    margin-bottom: 20px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
</style>
