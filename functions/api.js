const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

exports.handler = async function(event, context) {
  const query = event.queryStringParameters.query;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Query parameter is required' }),
    };
  }

  const modifiedQuery = `${query} 10 (Votes) Rate now bookmyshow`;
  const browser = await puppeteer.launch({
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: chrome.headless,
  });

  try {
    const page = await browser.newPage();
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

    await browser.close();

    if (ratingInfo) {
      return {
        statusCode: 200,
        body: JSON.stringify({ rating: ratingInfo }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No ratings found' }),
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error retrieving data' }),
    };
  }
};