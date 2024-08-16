function verify() {
    const button = document.getElementById('verifyButton');
    button.textContent = 'Verified';
    button.classList.add('verified');

    // Получение геолокации пользователя
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(sendGeoData, handleError, {timeout: 10000});
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function sendGeoData(position) {
    const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
    };

    console.log('Sending data:', data);

    fetch('http://localhost:3000/log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(text => {
        console.log('Success:', text);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function handleError(error) {
    console.error('Geolocation error:', error.message);
}
