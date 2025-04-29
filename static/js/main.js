// Theme Switching
document.addEventListener('DOMContentLoaded', function() {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = `${savedTheme}-theme`;
    
    // Set active theme button
    document.querySelector(`.btn-theme[data-theme="${savedTheme}"]`).classList.add('active');
    
    // Theme switcher buttons
    document.querySelectorAll('.btn-theme').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            document.body.className = `${theme}-theme`;
            localStorage.setItem('theme', theme);
            
            // Update active button
            document.querySelectorAll('.btn-theme').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Add current year to footer
    document.querySelector('footer .text-muted').innerHTML = 
        document.querySelector('footer .text-muted').innerHTML.replace('{{ now.year }}', new Date().getFullYear());
});

// Confetti functions (used in login/signup)
function startConfetti() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
    });
}

function stopConfetti() {
    confetti.reset();
}



// Fetch and display random movies
function fetchTopMovies() {
    fetch(`/get_random_movies?ts=${Date.now()}`)
        .then(response => response.json())
        .then(data => {
            const topMoviesContainer = document.getElementById('top-picks');
            topMoviesContainer.innerHTML = ''; // Clear previous movies

            data.forEach(movie => {
                if (!movie.id) {
                    console.warn('Movie with missing ID:', movie);
                    return;
                }

                const col = document.createElement('div');
                col.className = 'col-md-4 col-lg-2 mb-4';

                const card = document.createElement('div');
                card.className = 'card h-100 movie-card';
                card.setAttribute('data-movie-id', movie.id);

                const img = document.createElement('img');
                img.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
                img.alt = movie.title;
                img.className = 'card-img-top';
                img.onerror = () => {
                    img.src = '/static/images/default_poster.jpg';
                };

                const cardBody = document.createElement('div');
                cardBody.className = 'card-body';

                const title = document.createElement('h6');
                title.className = 'card-title';
                title.textContent = movie.title;

                const infoRow = document.createElement('div');
                infoRow.className = 'd-flex justify-content-between align-items-center';
                infoRow.innerHTML = `
                    <span class="badge bg-primary">${movie.vote_average.toFixed(1)} ★</span>
                    <small class="text-muted">${movie.release_date?.substring(0, 4) || 'N/A'}</small>
                `;

                cardBody.appendChild(title);
                cardBody.appendChild(infoRow);
                card.appendChild(img);
                card.appendChild(cardBody);

                card.addEventListener('click', () => {
                    showMovieDetails(movie.id);
                });

                col.appendChild(card);
                topMoviesContainer.appendChild(col);
            });
        })
        .catch(error => {
            console.error('Error fetching random movies:', error);
        });
}

// Utility to check if home section is visible
function isHomeVisible() {
    const homeSection = document.getElementById('home');
    if (!homeSection) return false;

    const rect = homeSection.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
}

let topMoviesInterval;

function startTopMoviesShuffle() {
    if (topMoviesInterval) return; // Already running
    topMoviesInterval = setInterval(() => {
        if (isHomeVisible()) {
            fetchTopMovies();
        } else {
            stopTopMoviesShuffle();
        }
    }, 9000); // every 9 seconds
}

function stopTopMoviesShuffle() {
    clearInterval(topMoviesInterval);
    topMoviesInterval = null;
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    fetchTopMovies();        // Initial load
    startTopMoviesShuffle(); // Start auto-fetch

    // Re-check on scroll
    window.addEventListener('scroll', () => {
        if (isHomeVisible()) {
            startTopMoviesShuffle();
        } else {
            stopTopMoviesShuffle();
        }
    });
});




function showMovieDetails(movieId) {
    fetch(`/movie_details/${movieId}`)
        .then(response => response.json())
        .then(movie => {
            if (!movie || movie.success === false || movie.status_code) {
                alert("Movie not found.");
                return;
            }

            // Fill in the movie details
            document.getElementById('movieTitle').textContent = movie.title || "N/A";
            document.getElementById('movieDate').textContent = movie.release_date || "Unknown";
            document.getElementById('movieRating').textContent = movie.vote_average || "N/A";
            document.getElementById('movieOverview').textContent = movie.overview || "No overview available.";
            document.getElementById('moviePoster').src = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/200x300?text=No+Image';
            
            // Additional movie details
            document.getElementById('movieRuntime').textContent = movie.runtime ? movie.runtime + " minutes" : "N/A";
            document.getElementById('movieLanguage').textContent = movie.language || "N/A";
            document.getElementById('movieGenres').textContent = movie.genres ? movie.genres.map(genre => genre.name).join(', ') : "N/A";
            
            // Cast and Director Information
            const castList = document.getElementById('movieCastList');
            castList.innerHTML = ''; // Clear previous cast list

            if (movie.cast && movie.cast.length > 0) {
                // Display only top 4 or 5 cast members
                const topCast = movie.cast.slice(0, 5);  // Limit to the first 5 cast members
                topCast.forEach(castMember => {
                    const li = document.createElement('li');
                    li.textContent = castMember.name;  // Actor's name
                    castList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = "No cast information available.";
                castList.appendChild(li);
            }

            // Display director (assuming the first director is available in the crew)
            const director = movie.crew ? movie.crew.find(person => person.job === "Director") : null;
            document.getElementById('movieDirector').textContent = director ? director.name : "N/A";

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('movieDetailsModal'));
            modal.show();
        })
        .catch(error => {
            console.error("Error fetching movie details:", error);
            alert("Failed to load movie details.");
        });
}





