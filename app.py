from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import requests
import random
from datetime import datetime
from datetime import datetime

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
    return render_template('home.html')

@app.route('/recommend', methods=['GET', 'POST'])
def recommend():
    if request.method == 'POST':
        # Get user preferences from form
        genres = request.form.getlist('genres')
        min_rating = request.form.get('min_rating', 6)
        year = request.form.get('year', '2020')
        language = request.form.get('language', 'en')
        
        # Call TMDB API to get recommendations
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
        # Process form data here
        return render_template('contact.html', success=True)
    return render_template('contact.html')

@app.route('/get_random_movies')
def get_random_movies():
    url = f"{BASE_URL}/discover/movie?api_key={TMDB_API_KEY}&sort_by=popularity.desc"
    response = requests.get(url)
    movies = response.json().get('results', [])
    random_movies = random.sample(movies, min(3, len(movies)))
    return jsonify(random_movies)

@app.route('/get_trending_movies')
def get_trending_movies():
    url = f"{BASE_URL}/trending/movie/week?api_key={TMDB_API_KEY}"
    response = requests.get(url)
    movies = response.json().get('results', [])
    return jsonify(movies[:10])

@app.route('/get_movie_quote')
def get_movie_quote():
    quotes = [
        {"text": "May the Force be with you.", "movie": "Star Wars"},
        {"text": "Here's looking at you, kid.", "movie": "Casablanca"},
        {"text": "You can't handle the truth!", "movie": "A Few Good Men"},
        {"text": "Life is like a box of chocolates.", "movie": "Forrest Gump"},
        {"text": "I'll be back.", "movie": "The Terminator"}
    ]
    return jsonify(random.choice(quotes))

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True)