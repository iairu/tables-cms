<script>
  import { cmsData, saveMovieList } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);

  let editingMovie = null;
  let searchQuery = '';
  let showDeleteConfirm = false;
  let movieToDelete = null;
  let showAddForm = false;
  
  // OMDb API state
  let showOmdbSearch = false;
  let omdbSearchQuery = '';
  let omdbResults = [];
  let omdbApiKey = '';
  let omdbLoading = false;
  let omdbError = '';

  const genres = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western'
  ];

  const defaultMovie = {
    id: '',
    title: '',
    year: new Date().getFullYear(),
    genre: '',
    rating: 0,
    watched: false,
    notes: '',
    director: '',
    imdbId: ''
  };
  
  $: filteredMovies = (cmsDataValue?.movieList || []).filter(movie => {
    const q = searchQuery.toLowerCase();
    return (movie.title || '').toLowerCase().includes(q) ||
           (movie.director || '').toLowerCase().includes(q) ||
           (movie.genre || '').toLowerCase().includes(q);
  });
  
  function handleAddMovie() {
    const newMovie = {
      ...defaultMovie,
      id: Date.now().toString()
    };
    saveMovieList([...(cmsDataValue.movieList || []), newMovie]);
    editingMovie = { ...newMovie };
    showAddForm = true;
  }
  
  function handleEditMovie(movie) {
    editingMovie = { ...movie };
  }
  
  function handleSaveMovie() {
    if (!editingMovie) return;
    
    const movies = (cmsDataValue.movieList || []).map(m =>
      m.id === editingMovie.id ? { ...editingMovie } : m
    );
    
    saveMovieList(movies);
    editingMovie = null;
  }
  
  function handleCancelEdit() {
    if (showAddForm && editingMovie) {
      // Remove the newly added movie if canceling
      const movies = (cmsDataValue.movieList || []).filter(m => m.id !== editingMovie.id);
      saveMovieList(movies);
    }
    editingMovie = null;
    showAddForm = false;
  }
  
  function requestDeleteMovie(movie) {
    movieToDelete = movie;
    showDeleteConfirm = true;
  }
  
  function confirmDeleteMovie() {
    showDeleteConfirm = false;
    if (movieToDelete) {
      const movies = (cmsDataValue.movieList || []).filter(m => m.id !== movieToDelete.id);
      saveMovieList(movies);
      movieToDelete = null;
    }
  }
  
  function toggleWatched(id) {
    const updated = (cmsDataValue.movieList || []).map(m =>
      m.id === id ? { ...m, watched: !m.watched } : m
    );
    saveMovieList(updated);
  }
  
  function updateRating(rating) {
    if (!editingMovie) return;
    editingMovie = { ...editingMovie, rating: Math.max(0, Math.min(10, rating)) };
  }

  // OMDb API functions
  async function searchOmdb() {
    if (!omdbSearchQuery.trim()) return;
    if (!omdbApiKey) {
      omdbError = 'Please enter an OMDb API key';
      return;
    }
    
    omdbLoading = true;
    omdbError = '';
    
    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(omdbSearchQuery)}&apikey=${omdbApiKey}`);
      const data = await response.json();
      
      if (data.Response === 'True') {
        omdbResults = data.Search || [];
      } else {
        omdbError = data.Error || 'No results found';
        omdbResults = [];
      }
    } catch (err) {
      omdbError = 'Failed to fetch from OMDb API';
      console.error('OMDb search error:', err);
    } finally {
      omdbLoading = false;
    }
  }

  async function importFromOmdb(imdbId) {
    omdbLoading = true;
    omdbError = '';
    
    try {
      const response = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${omdbApiKey}`);
      const data = await response.json();
      
      if (data.Response === 'True') {
        // Check for duplicate by IMDB ID
        const existing = (cmsDataValue.movieList || []).find(m => m.imdbId === imdbId);
        if (existing) {
          omdbError = 'This movie already exists in your list';
          omdbLoading = false;
          return;
        }
        
        // Map OMDb data to our movie format
        const newMovie = {
          id: Date.now().toString(),
          title: data.Title || '',
          year: parseInt(data.Year) || new Date().getFullYear(),
          genre: data.Genre ? data.Genre.split(', ')[0] : '',
          rating: 0,
          watched: false,
          notes: '',
          director: data.Director || '',
          imdbId: imdbId
        };
        
        saveMovieList([...(cmsDataValue.movieList || []), newMovie]);
        editingMovie = { ...newMovie };
        showAddForm = true;
        showOmdbSearch = false;
        omdbResults = [];
        omdbSearchQuery = '';
      } else {
        omdbError = data.Error || 'Failed to fetch movie details';
      }
    } catch (err) {
      omdbError = 'Failed to fetch movie details';
      console.error('OMDb import error:', err);
    } finally {
      omdbLoading = false;
    }
  }

  function closeOmdbSearch() {
    showOmdbSearch = false;
    omdbResults = [];
    omdbSearchQuery = '';
    omdbError = '';
  }
</script>

<div class="movies-section">
  {#if editingMovie}
    <!-- Edit Mode -->
    <div class="editor-fullscreen">
      <div class="editor-header">
        <button class="btn-back" on:click={handleCancelEdit}>
          <i class="fas fa-arrow-left"></i> Back to Movies
        </button>
        <h2>{showAddForm ? 'Add Movie' : 'Edit: ' + editingMovie.title}</h2>
        <button class="btn-success" on:click={handleSaveMovie}>
          <i class="fas fa-save"></i> Save
        </button>
      </div>
      
      <div class="editor-content">
        <div class="form-grid">
          <div class="form-group full">
            <label><strong>Title *</strong>
              <input type="text" bind:value={editingMovie.title} placeholder="Movie title" />
            </label>
          </div>
          
          <div class="form-group">
            <label><strong>Year</strong>
              <input type="number" bind:value={editingMovie.year} min="1888" max="2099" />
            </label>
          </div>
          
          <div class="form-group">
            <label><strong>Genre</strong>
              <select bind:value={editingMovie.genre}>
                <option value="">Select genre</option>
                {#each genres as genre}
                  <option value={genre}>{genre}</option>
                {/each}
              </select>
            </label>
          </div>
          
          <div class="form-group">
            <label><strong>Director</strong>
              <input type="text" bind:value={editingMovie.director} placeholder="Director name" />
            </label>
          </div>
          
          <div class="form-group">
            <label><strong>IMDB ID</strong>
              <input type="text" bind:value={editingMovie.imdbId} placeholder="tt1234567" />
            </label>
          </div>
          
          <div class="form-group full">
            <label><strong>Rating</strong>
              <div class="rating-input">
                {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as num}
                  <button
                    type="button"
                    class="rating-btn {editingMovie.rating >= num ? 'active' : ''}"
                    on:click={() => updateRating(num)}
                  >
                    {num}
                  </button>
                {/each}
              </div>
              <span class="rating-value">{editingMovie.rating}/10</span>
            </label>
          </div>
          
          <div class="form-group full">
            <label class="checkbox-label">
              <input type="checkbox" bind:checked={editingMovie.watched} />
              <strong>Watched</strong>
            </label>
          </div>
          
          <div class="form-group full">
            <label><strong>Notes</strong>
              <textarea bind:value={editingMovie.notes} rows="4" placeholder="Your thoughts about this movie..."></textarea>
            </label>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- List Mode -->
    <div class="section-header">
      <h2><i class="fas fa-film"></i> Movie Tracker</h2>
      <div class="header-actions">
        <input
          type="text"
          class="search-input"
          placeholder="Search movies..."
          bind:value={searchQuery}
        />
        <button class="btn-secondary" on:click={() => showOmdbSearch = true}>
          <i class="fas fa-cloud-download-alt"></i> Import from OMDb
        </button>
        <button class="btn-primary" on:click={handleAddMovie}>
          <i class="fas fa-plus"></i> Add Movie
        </button>
      </div>
    </div>
    
    {#if filteredMovies && filteredMovies.length > 0}
      <div class="movies-list">
        {#each filteredMovies as movie}
          <div class="movie-item {movie.watched ? 'watched' : ''}">
            <label class="checkbox-wrapper">
              <input
                type="checkbox"
                checked={movie.watched}
                on:change={() => toggleWatched(movie.id)}
              />
              <span class="checkmark"></span>
            </label>
            
            <div class="movie-info">
              <h4>{movie.title || 'Untitled'}</h4>
              <p class="movie-meta">
                {movie.year || '????'} • {movie.genre || 'No genre'} •
                {movie.director || 'Unknown director'}
              </p>
              {#if movie.rating}
                <p class="movie-rating">
                  {'⭐'.repeat(Math.floor(movie.rating / 2))} {movie.rating}/10
                </p>
              {/if}
            </div>
            
            <div class="movie-actions">
              <button class="btn-icon" on:click={() => handleEditMovie(movie)} title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-danger" on:click={() => requestDeleteMovie(movie)} title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        {/each}
      </div>
      
      <div class="movies-stats">
        <span>Total: <strong>{cmsDataValue?.movieList?.length || 0}</strong></span>
        <span>Watched: <strong>{cmsDataValue?.movieList?.filter(m => m.watched).length || 0}</strong></span>
        <span>Unwatched: <strong>{cmsDataValue?.movieList?.filter(m => !m.watched).length || 0}</strong></span>
      </div>
    {:else}
      <div class="empty-state">
        <i class="fas fa-film"></i>
        <h3>No movies tracked yet</h3>
        <p>Start building your movie list!</p>
        <button class="btn-primary" on:click={handleAddMovie}>
          <i class="fas fa-plus"></i> Add First Movie
        </button>
      </div>
    {/if}
  {/if}

  <!-- OMDb Search Modal -->
  {#if showOmdbSearch}
    <div class="modal-overlay" on:click={closeOmdbSearch}>
      <div class="modal-content" on:click|stopPropagation>
        <div class="modal-header">
          <h3><i class="fas fa-cloud-download-alt"></i> Import from OMDb</h3>
          <button class="btn-close" on:click={closeOmdbSearch}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label><strong>OMDb API Key</strong></label>
            <input 
              type="password" 
              bind:value={omdbApiKey} 
              placeholder="Enter your OMDb API key"
            />
            <small>Get a free API key at <a href="https://www.omdbapi.com/apikey.aspx" target="_blank">omdbapi.com</a></small>
          </div>
          
          <div class="search-bar">
            <input 
              type="text" 
              bind:value={omdbSearchQuery} 
              placeholder="Search for movies..."
              on:keydown={(e) => e.key === 'Enter' && searchOmdb()}
            />
            <button class="btn-primary" on:click={searchOmdb} disabled={omdbLoading}>
              <i class="fas fa-search"></i> {omdbLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {#if omdbError}
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i> {omdbError}
            </div>
          {/if}
          
          {#if omdbLoading}
            <div class="loading-state">
              <i class="fas fa-spinner fa-spin"></i> Searching OMDb...
            </div>
          {/if}
          
          {#if omdbResults.length > 0}
            <div class="omdb-results">
              {#each omdbResults as result}
                <div class="result-item">
                  <img 
                    src={result.Poster !== 'N/A' ? result.Poster : '/placeholder-poster.jpg'} 
                    alt={result.Title}
                    class="result-poster"
                  />
                  <div class="result-info">
                    <h4>{result.Title} ({result.Year})</h4>
                    <p class="result-type">{result.Type}</p>
                  </div>
                  <button 
                    class="btn-sm btn-success" 
                    on:click={() => importFromOmdb(result.imdbID)}
                    disabled={omdbLoading}
                  >
                    <i class="fas fa-plus"></i> Import
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Movie"
    message="Are you sure you want to delete this movie? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmDeleteMovie}
    onCancel={() => { showDeleteConfirm = false; movieToDelete = null; }}
  />
</div>

<style>
  .movies-section {
    padding: 20px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  
  .section-header h2 {
    font-size: 24px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .section-header h2 i {
    color: #2563eb;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .search-input {
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    width: 250px;
  }
  
  .editor-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary, white);
    z-index: 1000;
    display: flex;
    flex-direction: column;
  }
  
  .editor-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 20px;
    background: var(--bg-card, white);
  }
  
  .editor-header h2 {
    flex: 1;
    font-size: 20px;
    margin: 0;
  }
  
  .editor-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .form-group.full {
    grid-column: 1 / -1;
  }
  
  .form-group label {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .form-group strong {
    font-size: 14px;
    color: #475569;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .rating-input {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }
  
  .rating-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: var(--bg-card, white);
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }
  
  .rating-btn:hover {
    background: #f1f5f9;
  }
  
  .rating-btn.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  
  .rating-value {
    font-size: 14px;
    color: #64748b;
    margin-top: 8px;
  }
  
  .checkbox-label {
    flex-direction: row !important;
    align-items: center;
    cursor: pointer;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .movies-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .movie-item {
    background: var(--bg-card, white);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }
  
  .movie-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  .movie-item.watched {
    opacity: 0.7;
  }
  
  .movie-item.watched .movie-info h4 {
    text-decoration: line-through;
  }
  
  .checkbox-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .checkbox-wrapper input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkmark {
    height: 22px;
    width: 22px;
    background-color: #f1f5f9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }
  
  .checkbox-wrapper input:checked ~ .checkmark {
    background-color: #2563eb;
  }
  
  .checkmark:after {
    content: "";
    display: none;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .checkbox-wrapper input:checked ~ .checkmark:after {
    display: block;
  }
  
  .movie-info {
    flex: 1;
  }
  
  .movie-info h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
  }
  
  .movie-meta {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #64748b;
  }
  
  .movie-rating {
    margin: 0;
    font-size: 14px;
  }
  
  .movie-actions {
    display: flex;
    gap: 8px;
  }
  
  .btn-icon {
    width: 36px;
    height: 36px;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #475569;
  }
  
  .btn-icon:hover {
    background: #e2e8f0;
  }
  
  .btn-icon.btn-danger {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }
  
  .movies-stats {
    display: flex;
    gap: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    margin-top: 20px;
    font-size: 14px;
    color: #64748b;
  }
  
  .movies-stats strong {
    color: #0f172a;
  }
  
  .btn-primary,
  .btn-success,
  .btn-back {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: #2563eb;
    color: white;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  .btn-success {
    background: #10b981;
    color: white;
  }
  
  .btn-success:hover {
    background: #059669;
  }
  
  .btn-back {
    background: #f1f5f9;
    color: #475569;
  }
  
  .btn-back:hover {
    background: #e2e8f0;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: var(--bg-card, white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .empty-state i {
    font-size: 64px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  
  .empty-state h3 {
    margin: 8px 0;
    color: #0f172a;
  }
  
  .empty-state p {
    color: #64748b;
  }

  .btn-secondary {
    background: #64748b;
    color: white;
  }

  .btn-secondary:hover {
    background: #475569;
  }

  .btn-sm {
    padding: 6px 12px;
    font-size: 13px;
  }

  /* OMDb Modal Styles */
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
    z-index: 2000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #64748b;
  }

  .btn-close:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    color: #475569;
  }

  .form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
  }

  .form-group small {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
  }

  .form-group a {
    color: #2563eb;
    text-decoration: none;
  }

  .form-group a:hover {
    text-decoration: underline;
  }

  .search-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .search-bar input {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
  }

  .error-message {
    padding: 12px;
    background: #fee2e2;
    border-radius: 6px;
    color: #dc2626;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .loading-state {
    padding: 20px;
    text-align: center;
    color: #64748b;
    font-size: 14px;
  }

  .loading-state i {
    margin-right: 8px;
  }

  .omdb-results {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .result-item:hover {
    background: #f1f5f9;
  }

  .result-poster {
    width: 50px;
    height: 75px;
    object-fit: cover;
    border-radius: 4px;
    background: #e2e8f0;
  }

  .result-info {
    flex: 1;
  }

  .result-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: #0f172a;
  }

  .result-type {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }
</style>
