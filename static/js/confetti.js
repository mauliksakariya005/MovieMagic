// confetti.js - Complete version
(function() {
    // Configuration defaults
    var defaults = {
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
        gravity: 0.1,
        drift: 0,
        ticks: 200,
        decay: 0.95,
        scalar: 1
    };

    // Helper functions
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Confetti particle class
    function Particle(canvas, options) {
        this.canvas = canvas;
        this.options = options;
        this.context = canvas.getContext('2d');
        this.angle = randomInRange(0, Math.PI * 2);
        this.position = {
            x: options.origin.x * canvas.width,
            y: options.origin.y * canvas.height
        };
        this.velocity = {
            x: randomInRange(-4, 4) * options.scalar,
            y: randomInRange(-9, -5) * options.scalar
        };
        this.drift = randomInRange(-0.1, 0.1) * options.scalar;
        this.color = options.colors[Math.floor(randomInRange(0, options.colors.length))];
        this.radius = randomInRange(4, 8) * options.scalar;
        this.lifetime = options.ticks;
        this.decay = randomInRange(0.01, 0.03);
        this.alpha = 1;
        this.gravity = options.gravity * options.scalar;
        
        if (typeof this.color === 'string' && this.color.startsWith('#')) {
            this.rgb = hexToRgb(this.color);
        } else if (Array.isArray(this.color)) {
            this.rgb = {
                r: this.color[0],
                g: this.color[1],
                b: this.color[2]
            };
        } else {
            this.rgb = { r: 0, g: 0, b: 0 };
        }
    }

    Particle.prototype.update = function() {
        this.velocity.x += this.drift;
        this.velocity.y += this.gravity;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.alpha -= this.decay;
        this.lifetime--;
    };

    Particle.prototype.draw = function() {
        this.context.save();
        this.context.globalAlpha = this.alpha;
        this.context.fillStyle = `rgba(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${this.alpha})`;
        this.context.beginPath();
        this.context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        this.context.fill();
        this.context.restore();
    };

    // Main confetti function
    window.confetti = function(options) {
        // Merge options with defaults
        options = Object.assign({}, defaults, options);
        
        // Create canvas if it doesn't exist
        var existingCanvas = document.getElementById('confetti-canvas');
        var canvas = existingCanvas || document.createElement('canvas');
        var context = canvas.getContext('2d');
        
        if (!existingCanvas) {
            canvas.id = 'confetti-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1000';
            document.body.appendChild(canvas);
        }
        
        // Set canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Create particles
        var particles = [];
        for (var i = 0; i < options.particleCount; i++) {
            particles.push(new Particle(canvas, options));
        }
        
        // Animation loop
        function render() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            for (var i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                
                if (particles[i].lifetime <= 0 || particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            
            if (particles.length > 0) {
                requestAnimationFrame(render);
            } else {
                // Remove canvas when animation is complete
                if (canvas && canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
            }
        }
        
        // Start animation
        render();
    };
    
    // Reset function to stop confetti
    window.confetti.reset = function() {
        var canvas = document.getElementById('confetti-canvas');
        if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
        }
    };
})();