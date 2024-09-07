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
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <link rel="icon" href="https://leetcode.com/favicon.ico" type="image/x-icon">
            <style>
                html, body {
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                }

                body {
                    font-family: Arial, sans-serif;
                    background-image: url('https://i.postimg.cc/wvTfCXdv/plant-leaf-flower-blossom.png');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-color: #f2f2f2;
                    font-size: 16px;
                    color: #ffffff;
                }

                .container {
                    text-align: center; 
                    margin-top: 50px; 
                }

                .target-cursor {
                    width: 20px;
                    height: 20px;
                    background-color: transparent;
                    border: 2px solid #333;
                    border-radius: 50%;
                    position: absolute;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                    animation: moveCursor 0.3s infinite alternate;
                }

                @keyframes moveCursor {
                    0% {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1.5);
                        opacity: 0.5;
                    }
                }

                .search-container {
                    margin-top: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .username-input {
                    padding: 10px;
                    font-size: 16px;
                    border: 2px solid #0074D9;
                    border-radius: 4px 0 0 4px;
                    width: 300px;
                    margin-right: -2px; 
                }

                .search-button {
                    padding: 10px 20px;
                    font-size: 16px;
                    background-color: #0074D9;
                    color: #fff;
                    border: 2px solid #0074D9;
                    border-radius: 0 4px 4px 0;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    font-family: Arial, sans-serif;
                }

                .search-button:hover {
                    background-color: #0056b3;
                    border-color: #0056b3;
                    color: #fff;
                }

                .footer-button {
                    background-color: #00000094;
                    padding: 2px 20px;
                    color: white;
                    text-decoration: none;
                    font-size: 18px;
                    font-weight: bold;
                    border-radius: 5px;
                }

                .footer-button:hover {
                    opacity: 0.7;
                }
            </style>
            <title>BookMyShow Ratings Finder</title>
        </head>
        <body>
            <div class="target-cursor"></div>
            <p align="center">
                <b><img src="https://readme-typing-svg.herokuapp.com?font=Montserrat&size=20&duration=5001&color=8B0000&vCenter=true&center=true&width=460&lines=BOOKMYSHOW+MOVIES+LIVE+RATINGS;HAPPY+SEARCHING...!"></b>
            </p>
            <br>
            <div class="container">
			 <button style="background-color: #d5c5b57d; padding: 10px 20px; margin-right: 10px;">
        <a style="color: black; text-decoration: none; font-size: 14px; font-weight: bold;">BOOKMYSHOW MOVIES LIVE RATING COUNT</a>
    </button>
    <br><br>
                <button style="background-color: white; padding: 10px 20px; margin-right: 10px;">
                    <a href="mailto:yashwanth6678@gmail.com" style="color: black; text-decoration: none; font-size: 18px; font-weight: bold;">Contact Me</a>
                </button>
                <button style="background-color: white; padding: 10px 20px; margin-left: 10px;">
                    <a href="https://github.com/yashu1wwww" style="color: black; text-decoration: none; font-size: 18px; font-weight: bold;">GitHub Account</a>
                </button>
                <br><br>
                <button style="background-color: white; padding: 10px 20px;">
                    <a href="https://yashwanthwebproject.netlify.app" style="color: black; text-decoration: none; font-size: 18px; font-weight: bold;">Web Development Projects</a>
                </button>
            </div>
            <div class="search-container">
                <input type="text" class="username-input" id="query" placeholder="Enter Movie Name">
                <button class="search-button" onclick="search()">Search</button>
            </div>
            <br>
            <div id="result"></div>
            <div class="container" style="margin-top: 20px;">
                <button class="footer-button">© ® Developed By Yashwanth R</button>
            </div>
            <script>
                const targetCursor = document.querySelector('.target-cursor');
                document.addEventListener('mousemove', (e) => {
                    targetCursor.style.left = e.clientX + 'px';
                    targetCursor.style.top = e.clientY + 'px';
                });

                function search() {
                    const query = document.getElementById('query').value.trim();
                    if (query) {
                        window.location.href = '/search?query=' + encodeURIComponent(query);
                    } else {
                        alert('Please enter a movie name');
                    }
                }

                // Add event listener for "Enter" key press
                document.getElementById('query').addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        search();
                    }
                });
            </script>
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
                        <style>
                            body {
                                background-image: url('https://i.postimg.cc/wvTfCXdv/plant-leaf-flower-blossom.png');
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
                                color: #7d4242;
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
                                <button onclick="window.history.back()">Go Back</button>
                            </div>
                        </div>
                    </body>
                </html>
            `;

            searchCache.set(modifiedQuery, resultHtml);

            res.send(resultHtml);
        } else {
            res.status(404).send('No ratings found for the movie');
        }
    } catch (err) {
        res.status(500).send('An error occurred while fetching ratings');
    } finally {
        if (page) {
            await page.close();
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
