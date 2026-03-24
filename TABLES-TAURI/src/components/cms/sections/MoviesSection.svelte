<script>
  // Movie Tracker Section - Stub
  import { cmsData, saveMovieList } from '../../../stores/cmsData.js';
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  function handleAddMovie() {
    const newMovie = {
      id: Date.now().toString(),
      title: 'New Movie',
      year: new Date().getFullYear(),
      genre: '',
      rating: 0,
      watched: false,
      notes: ''
    };
    
    saveMovieList([...(cmsDataValue.movieList || []), newMovie]);
  }
  
  function toggleWatched(id) {
    const updated = (cmsDataValue.movieList || []).map(m => 
      m.id === id ? { ...m, watched: !m.watched } : m
    );
    saveMovieList(updated);
  }
</script>

<div class="movies-section">
  <div class="section-header">
    <h2><i class="fas fa-film"></i> Movie Tracker</h2>
    <button class="btn-primary" on:click={handleAddMovie}>
      <i class="fas fa-plus"></i> Add Movie
    </button>
  </div>
  
  {#if cmsDataValue?.movieList && cmsDataValue.movieList.length > 0}
    <div class="movies-list">
      {#each cmsDataValue.movieList as movie}
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
            <h4>{movie.title}</h4>
            <p class="movie-meta">
              {movie.year} • {movie.genre || 'No genre'} • 
              {movie.rating ? '⭐'.repeat(movie.rating) : 'Not rated'}
            </p>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <i class="fas fa-film"></i>
      <h3>No movies tracked yet</h3>
      <p>Start building your movie list!</p>
    </div>
  {/if}
</div>

<style>
  .movies-section {
    padding: 40px;
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
  
  .btn-primary {
    padding: 10px 16px;
    border: none;
    background: #2563eb;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  .movies-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .movie-item {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }
  
  .movie-item.watched {
    opacity: 0.6;
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
    margin: 0;
    font-size: 14px;
    color: #64748b;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
  }
  
  .empty-state i {
    font-size: 48px;
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
</style>
