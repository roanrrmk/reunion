const express = require('express');
var liveServer = require("live-server");
const path = require('path');

const fs = require('fs');

var cors = require('cors')
var app = express();
app.use(cors());
app.use(express.json());

function validateAndSanitizeData(data) {
    // Check that data is an object
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    // Check that data has the correct properties
    for (let house in data) {
        if (!data.hasOwnProperty(house)) {
            return false;
        }

        for (let room in data[house]) {
            if (!data[house].hasOwnProperty(room)) {
                return false;
            }

            for (let bed in data[house][room].beds) {
                if (!data[house][room].beds.hasOwnProperty(bed)) {
                    return false;
                }

                // Check that reserved is a boolean
                if (typeof data[house][room].beds[bed].reserved !== 'boolean') {
                    return false;
                }

                // Check that guest is a string
                if (typeof data[house][room].beds[bed].guest !== 'string') {
                    return false;
                }
            }
        }
    }

    return true;
}

app.post('/updateData', (req, res) => {
    console.log('Received data');
    if (!validateAndSanitizeData(req.body)) {
        res.status(400).send({ status: 'Error', message: 'Invalid data' });
        return;
    }

    fs.writeFile('roomsData.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });

    // Append data to log file
    fs.appendFile('log.txt', JSON.stringify(req.body, null, 2) + '\n', (err) => {
        if (err) throw err;
        console.log('Data appended to file');
    });

    res.send({ status: 'Success', message: 'Data written to file' });
});

app.get('/getData', (req, res) => {
    fs.readFile('roomsData.json', (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(80, () => console.log('Server running on port 80'));

// var params = {
// 	file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications),
//     port: 80, // Set the server port. Defaults to 8080.
// };
// liveServer.start(params);