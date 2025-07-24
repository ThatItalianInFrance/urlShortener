const db = require('../database');

let counter = 1000;
function generateShortCode() {
    return (counter++).toString(36);
}

const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function toBase62(num) {
    if (num === 0) return '0';
    let str = '';
    while (num > 0) {
        str = BASE62_ALPHABET[num % 62] + str;
        num = Math.floor(num / 62);
    }
    return str;
}

async function createShortUrl(originalUrl) {
    return new Promise((resolve, reject) => {
        // Step 1: Insert original URL (let DB assign auto-increment ID)
        db.query(
            'INSERT INTO urls (original_url) VALUES (?)',
            [originalUrl],
            (err, result) => {
                if (err) return reject(err);

                const insertId = result.insertId;
                const shortCode = toBase62(insertId);

                // Step 2: Update the row with generated shortCode
                db.query(
                    'UPDATE urls SET short_code = ? WHERE id = ?',
                    [shortCode, insertId],
                    (err) => {
                        if (err) return reject(err);
                        resolve(shortCode);
                    }
                );
            }
        );
    });
}


async function getOriginalUrl(shortCode) {
    return new Promise((resolve, reject) => {
        db.query('SELECT id, original_url FROM urls WHERE short_code = ?', [shortCode], (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result[0]);
        });
    });
}

async function recordClick(urlId, ipAddress, country, city) {
    console.log("🚀 ~ recordClick ~ urlId, ipAddress, country, city:", urlId, ipAddress, country, city)
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO clicks (url_id, ip_address, country, city) VALUES (?, ?, ?, ?)', [urlId, ipAddress, country, city], (err, result) => {
            if (err) {
                return reject(err);
            }
            db.query('UPDATE urls SET clicks = clicks + 1 WHERE id = ?', [urlId], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

module.exports = {
    createShortUrl,
    getOriginalUrl,
    recordClick
};

console.log('url.model.js loaded. Exports:', module.exports);