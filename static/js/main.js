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
    
    // Load random movie quote
    fetch('/get_movie_quote')
        .then(response => response.json())
        .then(quote => {
            document.getElementById('movie-quote-text').textContent = quote.text;
            document.getElementById('movie-quote-source').textContent = `— ${quote.movie}`;
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