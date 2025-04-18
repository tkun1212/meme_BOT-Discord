// src/data/lock_message.js
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, 'lock_message.json');

// JSONファイルがない場合は作成
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({}, null, 2));
}

function getData() {
    const rawData = fs.readFileSync(dataFile);
    return JSON.parse(rawData);
}

function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports = { getData, saveData };
