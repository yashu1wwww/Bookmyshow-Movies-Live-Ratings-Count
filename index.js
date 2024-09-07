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
            <link rel="icon" href="data:image/png;base64,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" type="image/x-icon">
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
                    border-radius: 34px;
                }

                .footer-button:hover {
                    opacity: 0.7;
                }
            </style>
            <title>BookMyShow Movies Ratings Live Count</title>
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
                <input type="text" class="username-input" id="query" placeholder="Ex: Godzilla or Godzilla 2014">
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
						<link rel="icon" href="data:image/png;base64,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" type="image/x-icon">
                        <title>BookMyShow Movies Ratings Live Count</title>
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
            res.status(404).send('Enter The Movie Name Correctly');
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
