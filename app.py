from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import requests
import os
import random
from datetime import datetime
from flask_cors import CORS


app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

# TMDB API configuration
TMDB_API_KEY = '4c04329dcdce0bb4e73a10f729b22393'
BASE_URL = 'https://api.themoviedb.org/3'

# Simulated user database (in a real app, use a proper database)
users = {
    'user1': {'password': 'pass1', 'name': 'Movie Fan'},
    'user2': {'password': 'pass2', 'name': 'Film Buff'}
}

@app.context_processor
def inject_now():
    return {'now': datetime.now()}

@app.route('/')
def home():
    # Example backdrop image (change it as necessary)
    backdrop_path = 'your_default_image.jpg'
    return render_template('home.html', backdrop_path=backdrop_path)

@app.route('/recommend', methods=['GET', 'POST'])
def recommend():
    if request.method == 'POST':
        genres = request.form.getlist('genres')
        min_rating = request.form.get('min_rating', 6)
        year = request.form.get('year', '2020')
        language = request.form.get('language', 'en')
        
        url = f"{BASE_URL}/discover/movie?api_key={TMDB_API_KEY}"
        url += f"&vote_average.gte={min_rating}&primary_release_year={year}&with_original_language={language}"
        if genres:
            url += f"&with_genres={','.join(genres)}"
        
        response = requests.get(url)
        movies = response.json().get('results', [])
        
        return render_template('recommend.html', movies=movies)
    return render_template('recommend.html')

@app.route('/search')
def search():
    query = request.args.get('q', '')
    if query:
        url = f"{BASE_URL}/search/movie?api_key={TMDB_API_KEY}&query={query}"
        response = requests.get(url)
        movies = response.json().get('results', [])
        return render_template('search.html', movies=movies, query=query)
    return render_template('search.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if username in users and users[username]['password'] == password:
            session['username'] = username
            session['name'] = users[username]['name']
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': 'Invalid credentials'})
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        name = request.form['name']
        
        if username in users:
            return jsonify({'success': False, 'message': 'Username already exists'})
        
        users[username] = {'password': password, 'name': name}
        return jsonify({'success': True})
    return render_template('signup.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('home'))

@app.route('/profile')
def profile():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('profile.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        return render_template('contact.html', success=True)
    return render_template('contact.html')

@app.route('/get_random_movies')
def get_random_movies():
    try:
        random_page = random.randint(1, 20) 
        response = requests.get(f'{BASE_URL}/movie/popular?api_key={TMDB_API_KEY}&page={random_page}')
        if response.status_code == 200:
            data = response.json()
            movies = data['results']
            random.shuffle(movies)  # Shuffle to get different ones each time
            return jsonify(movies[:6])
        else:
            return jsonify({'error': 'Failed to fetch data from TMDB'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/movie_details/<int:movie_id>')
def movie_details(movie_id):
    try:
        # Fetch basic movie details
        url = f'https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}&language=en-US'
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({'error': 'Movie not found'}), 404
        
        movie_data = response.json()

        # Fetch cast details
        cast_url = f'https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={TMDB_API_KEY}'
        cast_response = requests.get(cast_url)
        cast_data = cast_response.json() if cast_response.status_code == 200 else {}

        # Fetch crew details (including director)
        crew_url = f'https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={TMDB_API_KEY}'
        crew_response = requests.get(crew_url)
        crew_data = crew_response.json() if crew_response.status_code == 200 else {}

        # Prepare movie info along with cast and crew
        movie_info = {
            'id': movie_data.get('id'),
            'title': movie_data.get('title'),
            'release_date': movie_data.get('release_date'),
            'overview': movie_data.get('overview'),
            'vote_average': movie_data.get('vote_average'),
            'poster_path': movie_data.get('poster_path'),
            'genres': movie_data.get('genres', []),
            'runtime': movie_data.get('runtime'),
            'language': movie_data.get('original_language'),
            'cast': cast_data.get('cast', []),
            'crew': crew_data.get('crew', []),  # Includes director
        }

        return jsonify(movie_info)

    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/get_movies_by_language/<language>')
def get_movies_by_language(language):
    url = f"{BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&with_original_language={language}"
    response = requests.get(url)
    movies = response.json().get('results', [])
    return jsonify(movies[:6])  # Show only 6 movies


@app.route('/get_surprise_movie')
def get_surprise_movie():
    url = f"{BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&sort_by=popularity.desc"
    response = requests.get(url)
    movies = response.json().get('results', [])
    random_movies = random.sample(movies, 3)  # Get 3 random movies
    return jsonify(random_movies)


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)