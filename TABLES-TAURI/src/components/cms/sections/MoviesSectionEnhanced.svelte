<script>
  import { cmsData, saveMovieList } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);

  let searchQuery = '';
  let omdbApiKey = '';
  let omdbSearchResults = [];
  let showOmdbSearch = false;
  let isSearching = false;
  let omdbError = '';
  let showDeleteConfirm = false;
  let movieToDelete = null;
  let isEditing = false;
  let editingMovie = null;
  let showSettings = false;

  const genres = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
    'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'
  ];

  $: filteredMovies = (cmsDataValue?.movieList || [])
    .filter(movie => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        movie.title?.toLowerCase().includes(query) ||
        movie.director?.toLowerCase().includes(query) ||
        movie.genre?.toLowerCase().includes(query)
      );
    });

  $: stats = {
    total: cmsDataValue?.movieList?.length || 0,
    watched: (cmsDataValue?.movieList || []).filter(m => m.watched).length,
    unwatched: (cmsDataValue?.movieList || []).filter(m => !m.watched).length
  };

  async function searchOmdb() {
    if (!omdbApiKey || !searchQuery) return;
    
    isSearching = true;
    omdbError = '';
    omdbSearchResults = [];

    try {
      const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${omdbApiKey}`);
      const data = await response.json();
      
      if (data.Response === 'True') {
        omdbSearchResults = data.Search || [];
      } else {
        omdbError = data.Error || 'No results found';
      }
    } catch (error) {
      omdbError = 'Failed to search OMDb API';
    } finally {
      isSearching = false;
    }
  }

  async function importFromOmdb(imdbID) {
    isSearching = true;
    try {
      const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${omdbApiKey}`);
      const data = await response.json();
      
      if (data.Response === 'True') {
        const newMovie = {
          id: Date.now().toString(),
          title: data.Title || 'Unknown',
          year: parseInt(data.Year) || new Date().getFullYear(),
          genre: data.Genre || '',
          director: data.Director || '',
          imdbId: data.imdbID,
          poster: data.Poster !== 'N/A' ? data.Poster : '',
          rating: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : 0,
          watched: false,
          notes: ''
        };
        saveMovieList([...(cmsDataValue.movieList || []), newMovie]);
        showOmdbSearch = false;
        omdbSearchResults = [];
        searchQuery = '';
      }
    } catch (error) {
      console.error('OMDb import error:', error);
    } finally {
      isSearching = false;
    }
  }

  function addMovie() {
    const newMovie = {
      id: Date.now().toString(),
      title: 'New Movie',
      year: new Date().getFullYear(),
      genre: '',
      director: '',
      imdbId: '',
      poster: '',
      rating: 0,
      watched: false,
      notes: ''
    };
    saveMovieList([...(cmsDataValue.movieList || []), newMovie]);
    editingMovie = newMovie;
    isEditing = true;
  }

  function editMovie(movie) {
    editingMovie = { ...movie };
    isEditing = true;
  }

  function saveMovie() {
    if (!editingMovie?.title) return;
    const updatedMovies = (cmsDataValue.movieList || []).map(m =>
      m.id === editingMovie.id ? { ...editingMovie } : m
    );
    saveMovieList(updatedMovies);
    isEditing = false;
    editingMovie = null;
  }

  function deleteMovie(movie) {
    movieToDelete = movie;
    showDeleteConfirm = true;
  }

  function confirmDelete() {
    if (movieToDelete) {
      saveMovieList((cmsDataValue.movieList || []).filter(m => m.id !== movieToDelete.id));
      showDeleteConfirm = false;
      movieToDelete = null;
      isEditing = false;
      editingMovie = null;
    }
  }

  function toggleWatched(movie) {
    const updatedMovies = (cmsDataValue.movieList || []).map(m =>
      m.id === movie.id ? { ...m, watched: !m.watched } : m
    );
    saveMovieList(updatedMovies);
  }
</script>

<div class="movies-section">
  <div class="section-header">
    <h2><i class="fas fa-film"></i> Movie Tracker</h2>
    <div class="header-actions">
      <input
        type="text"
        class="search-input"
        placeholder="Search movies..."
        bind:value={searchQuery}
      />
      <button class="btn btn-secondary btn-sm" on:click={() => showOmdbSearch = true}>
        <i class="fas fa-search"></i>
        Search OMDb
      </button>
      <button class="btn btn-primary btn-sm" on:click={addMovie}>
        <i class="fas fa-plus"></i>
        Add Movie
      </button>
    </div>
  </div>

  <div class="stats-bar">
    <div class="stat">
      <span class="stat-value">{stats.total}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat">
      <span class="stat-value" style="color: var(--color-secondary)">{stats.watched}</span>
      <span class="stat-label">Watched</span>
    </div>
    <div class="stat">
      <span class="stat-value" style="color: var(--color-primary)">{stats.unwatched}</span>
      <span class="stat-label">Unwatched</span>
    </div>
  </div>

  {#if showOmdbSearch}
    <div class="omdb-search-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Search OMDb Database</h3>
          <button class="btn-icon" on:click={() => showOmdbSearch = false}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="api-key-input">
            <label>OMDb API Key</label>
            <input
              type="text"
              placeholder="Enter your OMDb API key"
              bind:value={omdbApiKey}
            />
            <a href="https://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener">
              Get free API key
            </a>
          </div>
          <div class="search-box">
            <input
              type="text"
              placeholder="Search for movies..."
              bind:value={searchQuery}
              on:keydown={(e) => e.key === 'Enter' && searchOmdb()}
            />
            <button class="btn btn-primary" on:click={searchOmdb} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {#if omdbError}
            <div class="error-message">{omdbError}</div>
          {/if}
          {#if omdbSearchResults.length > 0}
            <div class="search-results">
              {#each omdbSearchResults as result (result.imdbID)}
                <div class="result-item" on:click={() => importFromOmdb(result.imdbID)}>
                  {#if result.Poster !== 'N/A'}
                    <img src={result.Poster} alt={result.Title} />
                  {/if}
                  <div class="result-info">
                    <h4>{result.Title}</h4>
                    <p>{result.Year} • {result.Type}</p>
                  </div>
                  <button class="btn btn-sm btn-primary">
                    <i class="fas fa-plus"></i>
                    Import
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <div class="movies-grid">
    {#each filteredMovies as movie (movie.id)}
      <div class="movie-card" class:watched={movie.watched}>
        {#if movie.poster}
          <img src={movie.poster} alt={movie.title} class="movie-poster" />
        {:else}
          <div class="movie-poster-placeholder">
            <i class="fas fa-film"></i>
          </div>
        {/if}
        <div class="movie-info">
          <h3 class="movie-title">{movie.title}</h3>
          <p class="movie-year">{movie.year}</p>
          <p class="movie-genre">{movie.genre}</p>
          <p class="movie-director">Dir. {movie.director}</p>
          <div class="movie-rating">
            <span>Rating:</span>
            <div class="rating-stars">
              {#each Array(10) as _, i (i)}
                <button
                  class="rating-star"
                  class:filled={movie.rating >= i + 1}
                  on:click={() => updateRating(movie, i + 1)}
                >
                  ★
                </button>
              {/each}
            </div>
            <span class="rating-value">{movie.rating}/10</span>
          </div>
          <div class="movie-actions">
            <button
              class="btn btn-sm"
              class:btn-success={movie.watched}
              on:click={() => toggleWatched(movie)}
            >
              <i class="fas fa-{movie.watched ? 'check' : 'eye'}"></i>
              {movie.watched ? 'Watched' : 'Mark Watched'}
            </button>
            <button class="btn-icon btn-xs" on:click={() => editMovie(movie)}>
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-xs btn-danger" on:click={() => deleteMovie(movie)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if isEditing && editingMovie}
    <div class="editor-panel">
      <h3>Edit Movie</h3>
      <div class="editor-fields">
        <div class="field-row">
          <label>Title</label>
          <input type="text" bind:value={editingMovie.title} />
        </div>
        <div class="field-row">
          <label>Year</label>
          <input type="number" bind:value={editingMovie.year} />
        </div>
        <div class="field-row">
          <label>Genre</label>
          <select bind:value={editingMovie.genre}>
            <option value="">Select Genre</option>
            {#each genres as genre}
              <option value={genre}>{genre}</option>
            {/each}
          </select>
        </div>
        <div class="field-row">
          <label>Director</label>
          <input type="text" bind:value={editingMovie.director} />
        </div>
        <div class="field-row">
          <label>IMDb ID</label>
          <input type="text" bind:value={editingMovie.imdbId} />
        </div>
        <div class="field-row">
          <label>Poster URL</label>
          <input type="text" bind:value={editingMovie.poster} />
        </div>
        <div class="field-row">
          <label>Notes</label>
          <textarea bind:value={editingMovie.notes} rows="3"></textarea>
        </div>
      </div>
      <div class="editor-actions">
        <button class="btn btn-secondary" on:click={() => { isEditing = false; editingMovie = null; }}>
          Cancel
        </button>
        <button class="btn btn-primary" on:click={saveMovie}>
          Save
        </button>
      </div>
    </div>
  {/if}

  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Movie"
    message="Are you sure you want to delete '{movieToDelete?.title}'?"
    onConfirm={confirmDelete}
    onCancel={() => showDeleteConfirm = false}
  />
</div>

<style>
  .movies-section {
    padding: 20px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .search-input {
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    width: 250px;
  }

  .stats-bar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 16px;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
  }

  .stat-label {
    font-size: 12px;
    color: var(--text-tertiary);
    text-transform: uppercase;
  }

  .movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .movie-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal);
  }

  .movie-card.watched {
    opacity: 0.7;
  }

  .movie-card:hover {
    transform: translateY(-2px);
  }

  .movie-poster {
    width: 100%;
    height: 400px;
    object-fit: cover;
  }

  .movie-poster-placeholder {
    width: 100%;
    height: 400px;
    background: var(--bg-tertiary);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .movie-poster-placeholder i {
    font-size: 64px;
    color: var(--text-muted);
  }

  .movie-info {
    padding: 16px;
  }

  .movie-title {
    font-size: var(--text-lg);
    margin: 0 0 8px;
  }

  .movie-year,
  .movie-genre,
  .movie-director {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 4px 0;
  }

  .movie-rating {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 12px 0;
  }

  .rating-stars {
    display: flex;
    gap: 2px;
  }

  .rating-star {
    background: none;
    border: none;
    font-size: 18px;
    color: var(--border-medium);
    cursor: pointer;
    padding: 0;
  }

  .rating-star.filled {
    color: var(--color-accent);
  }

  .movie-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .btn-sm {
    padding: 5px 10px;
    font-size: 13px;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-success {
    background: var(--color-secondary);
    color: white;
  }

  .btn-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .btn-icon.btn-xs {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }

  .omdb-search-modal {
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

  .modal-content {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .modal-body {
    padding: 20px;
  }

  .api-key-input {
    margin-bottom: 16px;
  }

  .api-key-input label {
    display: block;
    margin-bottom: 6px;
    font-weight: 600;
  }

  .search-box {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .search-box input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
  }

  .error-message {
    color: #ef4444;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
    margin-bottom: 16px;
  }

  .search-results {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .result-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .result-item:hover {
    background: var(--bg-tertiary);
  }

  .result-item img {
    width: 50px;
    height: 75px;
    object-fit: cover;
    border-radius: var(--radius-sm);
  }

  .result-info {
    flex: 1;
  }

  .result-info h4 {
    margin: 0 0 4px;
    font-size: var(--text-base);
  }

  .result-info p {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .editor-panel {
    margin-top: 20px;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-md);
  }

  .editor-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-row label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .field-row input,
  .field-row select,
  .field-row textarea {
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .editor-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
</style>
