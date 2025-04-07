const fs = require('fs');
const path = require('path');

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'assets', 'enem_data_with_lessons.json');

// Read the JSON file
console.log(`Reading file: ${jsonFilePath}`);
let jsonData = fs.readFileSync(jsonFilePath, 'utf8');

// Count original occurrences
const originalCount = (jsonData.match(/https:\/\/enem\.dev\//g) || []).length;
console.log(`Found ${originalCount} occurrences of "https://enem.dev/" in the file`);

// Replace all occurrences of "https://enem.dev/" with "assets/img/"
// This regex matches image markdown syntax: ![](https://enem.dev/...)
// and replaces it with ![](assets/img/filename.ext)
const regex = /!\[\]\(https:\/\/enem\.dev\/.*?\/([^\/]+)\)/g;
let replacedData = jsonData.replace(regex, '![](assets/img/$1)');

// Also replace broken-image.svg references
const brokenImageRegex = /!\[\]\(https:\/\/enem\.dev\/broken-image\.svg\)/g;
replacedData = replacedData.replace(brokenImageRegex, '![](assets/img/broken-image.svg)');

// Replace any remaining https://enem.dev/ references
const remainingRegex = /https:\/\/enem\.dev\//g;
replacedData = replacedData.replace(remainingRegex, 'assets/img/');

// Count replaced occurrences
const replacedCount = (replacedData.match(/!\[\]\(assets\/img\//g) || []).length;
console.log(`Replaced ${replacedCount} occurrences with "assets/img/"`);

// Write the modified JSON back to the file
fs.writeFileSync(jsonFilePath, replacedData, 'utf8');
console.log(`File updated successfully: ${jsonFilePath}`);

// Also update the iOS assets file if it exists
const iosJsonFilePath = path.join(__dirname, 'ios-assets', 'assets', 'assets', 'enem_data_with_lessons.json');
if (fs.existsSync(iosJsonFilePath)) {
    console.log(`Reading iOS assets file: ${iosJsonFilePath}`);
    let iosJsonData = fs.readFileSync(iosJsonFilePath, 'utf8');

    // Replace all occurrences in the iOS assets file
    const iosReplacedData = iosJsonData.replace(regex, '![](assets/img/$1)');

    // Write the modified JSON back to the iOS assets file
    fs.writeFileSync(iosJsonFilePath, iosReplacedData, 'utf8');
    console.log(`iOS assets file updated successfully: ${iosJsonFilePath}`);
}

console.log('All done!');
