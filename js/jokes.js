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

function updateJoke() {
    const jokeText = document.getElementById('joke-text');
    jokeText.textContent = 'Loading...';
    
    getDadJoke().then(joke => {
        jokeText.textContent = joke;
    });
}

// Add click event listener to joke button
document.addEventListener('DOMContentLoaded', () => {
    const jokeButton = document.querySelector('.joke-btn');
    jokeButton.addEventListener('click', updateJoke);
    // Load initial joke
    updateJoke();
});
