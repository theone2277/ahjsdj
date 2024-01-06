import express from 'express';
import { get } from 'https';
import cheerio from 'cheerio';

const app = express();
const port = process.env.PORT || 3000;

app.get('/q=:query', async (req, res) => {
  // Function to perform the web scrape
  async function scrapeSearchResults(query) {
    return new Promise((resolve, reject) => {
      const searchUrl = new URL(`https://www.bing.com/search?q=${query}`);

      get(searchUrl, (searchResponse) => {
        let rawData = '';
        searchResponse.on('data', (chunk) => {
          rawData += chunk;
        });

        searchResponse.on('end', () => {
          if (searchResponse.statusCode !== 200) {
            return reject(new Error('Invalid or missing response from search API'));
          }

          const $ = cheerio.load(rawData);
          const searchResults = [];

          $('li.b_algo').each((index, element) => {
            const title = $(element).find('h2').text().trim();
            const link = $(element).find('h2 > a').attr('href');
            const snippet = $(element).find('p').text().trim();
            if (title && link && snippet) {
              searchResults.push({ title, link, snippet });
            }
          });

          resolve(searchResults);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }

  try {
    const searchQuery = encodeURIComponent(req.params.query);
    const results = await scrapeSearchResults(searchQuery);
    res.json(results);
  } catch (error) {
    console.error(`Failed to scrape search results: ${error.message}`);
    res.status(500).send('Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
