const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const logDir = path.join(__dirname, 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to create a text file with the current timestamp
app.post('/create-log', (req, res) => {
    const timestamp = new Date().toISOString();
    const filename = `${timestamp}.txt`;
    const filepath = path.join(logDir, filename);

    fs.writeFile(filepath, timestamp, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating file');
        }
        res.status(201).send(`File ${filename} created successfully`);
    });
});

// API endpoint to retrieve all text files in the logs directory
app.get('/logs', (req, res) => {
    fs.readdir(logDir, (err, files) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading directory');
        }
        res.status(200).json(files);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
