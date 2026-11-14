const fs = require("fs").promises;
const path = require("path");

const dataDirectory = path.join(__dirname, "..", "data");

async function readDataFile(fileName) {
    const filePath = path.join(dataDirectory, fileName);
    const fileContent = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
}

async function writeDataFile(fileName, data) {
    const filePath = path.join(dataDirectory, fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 4));
}

module.exports = { readDataFile, writeDataFile };
