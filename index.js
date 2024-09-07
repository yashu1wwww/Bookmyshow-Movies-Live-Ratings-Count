const express = require('express');
const puppeteer = require('puppeteer');
const NodeCache = require('node-cache');

const app = express();
const port = 3000;

const searchCache = new NodeCache({ stdTTL: 600 });

let browser;

(async () => {
    browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    });
})();

app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>BookMyShow Ratings</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link rel="icon" href="https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/favicon_desktop_32x32._CB1582158068_.png" type="image/x-icon">
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    body {
                        background-image: url('https://wallpaperaccess.com/full/1567770.gif');
                        background-size: cover;
                        background-repeat: no-repeat;
                        background-attachment: fixed;
                        color: white;
                        text-align: center;
                    }
                    .container {
                        padding-top: 100px;
                    }
                    .form-container {
                        background: rgba(0, 0, 0, 0.5);
                        padding: 58px;
                        border-radius: 40px;
                        display: inline-block;
                    }
                    .result-container {
                        margin-top: 20px;
                    }
                    h4 {
                        color: black;
                    }
                    button {
                        margin-top: 20px;
                    }
                    input[type="text"] {
                        color: black; /* Ensure text color is black */
                    }
                    .contact-button,
                    .projects-button {
                        background-color: #ffffffb5;
                        padding: 10px 20px;
                        margin-right: 1px;
                        border: 2px solid white;
                        border-radius: 5px;
                        color: black;
                        text-decoration: none;
                        font-size: 18px;
                        font-weight: bold;
                        display: block;
                        text-align: center;
                        transition: background-color 0.3s ease;
                    }
                    .contact-button:hover,
                    .projects-button:hover {
                        background-color: #e0e0e0;
                    }
                    .footer-button {
                        background-color: #2d3033;
                        color: white;
                        font-weight: bold;
                        border-radius: 5px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        transition: opacity 0.3s ease;
                        padding: 10px 20px;
                    }
                    .footer-button:hover {
                        opacity: 0.7;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="form-container">
                        <form action="/search" method="get" class="space-y-2">
                            <a href="mailto:yashwanth6678@gmail.com" class="contact-button">Contact</a>
                            <br><br>
                            <a href="https://yashwanthwebproject.netlify.app" class="projects-button">Web Development Projects</a>
                            <br><br>
                            <label for="query" class="text-lg font-bold" style="text-decoration: underline; font-size: 18px; display: inline-block; vertical-align: middle;">BOOKMYSHOW MOVIES LIVE RATINGS COUNT</label>
                            <br><br>
                            <input type="text" id="query" name="query" required placeholder="Movie Name" class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-blue-400 focus:ring-blue-400">
                            <br><br>
                            <button type="submit" class="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">Search</button>
                        </form>
                        <button class="footer-button" onclick="window.history.back()">© ® Developed By Yashwanth R</button>
                    </div>
                </div>
            </body>
        </html>
    `);
});

app.get('/search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        res.status(400).send('Query parameter is required');
        return;
    }

    const modifiedQuery = `${query} 10 (Votes) Rate now bookmyshow`;

    const cachedResult = searchCache.get(modifiedQuery);
    if (cachedResult) {
        return res.send(cachedResult);
    }

    let page;
    try {
        page = await browser.newPage();

        const encodedQuery = encodeURIComponent(`${modifiedQuery} site:bookmyshow.com`);
        const url = `https://www.google.com/search?q=${encodedQuery}`;

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const ratingInfo = await page.evaluate(() => {
            const results = document.querySelectorAll('.g');
            let ratingText = null;

            for (const result of results) {
                ratingText = result.innerText.match(/\d+\.\d+\/10\.\s\(\d+\.?\d*K?\s?Votes\)/);
                if (ratingText) {
                    return ratingText[0];
                }
            }

            return null;
        });

        if (ratingInfo) {
            const resultHtml = `
                <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>BookMyShow Ratings</title>
                        <link rel="icon" href="https://m.media-amazon.com/images/G/01/imdb/images-ANDW73HA/favicon_desktop_32x32._CB1582158068_.png" type="image/x-icon">
                        <style>
                            body {
                                background-image: url('https://wallpaperaccess.com/full/1567770.gif');
                                background-size: cover;
                                background-repeat: no-repeat;
                                background-attachment: fixed;
                                color: white;
                                text-align: center;
                            }
                            .container {
                                padding-top: 100px;
                            }
                            .result-container {
                                margin-top: 20px;
                            }
                            h1 {
                                color: #7d4242; /* Changed color for better readability */
                            }
                            .rating-text {
                                font-weight: bold;
                                color: black;
                                font-size: 24px;
                            }
                            button {
                                margin-top: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="result-container">
                                <h1>Ratings for "${query}"</h1>
                                <p class="rating-text">${ratingInfo}</p>
                                <button onclick="window.history.back()">Back</button>
                            </div>
                        </div>
                    </body>
                </html>
            `;

            searchCache.set(modifiedQuery, resultHtml);
            res.send(resultHtml);
        } else {
            res.send('No ratings found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    } finally {
        if (page) {
            await page.close();
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
