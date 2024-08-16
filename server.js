// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

// Ваш реальный API-ключ OpenCage
const OPEN_CAGE_API_KEY = '3276eb91f7264d498a77d1fc09bfad9d';
const OPEN_CAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

// Путь к папке с логами
const logDirectory = path.join(__dirname, 'LOG');

// Убедимся, что папка существует
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Путь к файлу лога
const logFilePath = path.join(logDirectory, 'log.txt');

// Middleware для обработки JSON тела запроса
app.use(express.json());
app.use(cors());

// Хранение номера последней записи и предыдущих координат
let lastLogNumber = 0;
let lastCoordinates = { latitude: null, longitude: null };

// Функция для получения страны и города по координатам
async function getLocationInfo(latitude, longitude) {
    try {
        const response = await axios.get(OPEN_CAGE_API_URL, {
            params: {
                key: OPEN_CAGE_API_KEY,
                q: `${latitude},${longitude}`,
                pretty: 1,
                no_annotations: 1
            }
        });

        const result = response.data.results[0];
        if (result) {
            const country = result.components.country_code.toUpperCase();
            const city = result.components.city || result.components.town || result.components.village;
            return `${country}, ${city || 'Unknown City'}`;
        } else {
            return 'Unknown Location';
        }
    } catch (error) {
        console.error('Error fetching location info:', error.message);
        if (error.response) {
            console.error('Response error data:', error.response.data);
            console.error('Response error status:', error.response.status);
        }
        return 'Error fetching location';
    }
}

// Обработка POST запросов на /log
app.post('/log', async (req, res) => {
    const { timestamp, latitude, longitude } = req.body;

    // Проверка на дубликат
    if (latitude === lastCoordinates.latitude && longitude === lastCoordinates.longitude) {
        const duplicateMessage = `${lastLogNumber}. Duplicate Entry\n`;
        fs.appendFile(logFilePath, duplicateMessage, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                res.status(500).send('Error writing to log file.');
            } else {
                res.status(200).send('Duplicate entry logged.');
            }
        });
        return;
    }

    // Обновление последних координат
    lastCoordinates = { latitude, longitude };

    // Получение информации о местоположении
    const location = await getLocationInfo(latitude, longitude);

    // Формирование записи в логе с инкрементированным номером
    lastLogNumber++;
    const logData = `${lastLogNumber}. ${location}\n`;

    console.log('Received data:', logData);

    fs.appendFile(logFilePath, logData, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            res.status(500).send('Error writing to log file.');
        } else {
            res.status(200).send('Data logged successfully.');
        }
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
