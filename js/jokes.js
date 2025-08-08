async function getDadJoke() {
    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        return data.joke;
    } catch (error) {
        return 'Why did the joke fail to load? Because it was dad tired!';
    }
}

function fireConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00b4db', '#0083b0', '#2d9f67', '#ffffff']
    });
}

function updateJoke() {
    const jokeText = document.getElementById('joke-text');
    jokeText.textContent = 'Loading...';
    
    getDadJoke().then(joke => {
        jokeText.textContent = joke;
        fireConfetti(); // Trigger confetti after the joke loads
    });
}

// Add click event listener to joke button
document.addEventListener('DOMContentLoaded', () => {
    const jokeButton = document.querySelector('.joke-btn');
    jokeButton.addEventListener('click', updateJoke);
    // Load initial joke
    updateJoke();
});
