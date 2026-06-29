const https = require("https");

const searchUnsplash = (query) => {
  return new Promise((resolve, reject) => {
    const url = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
    https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        // Regex to find unsplash image urls
        // Format like: https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80...
        const regex = /https:\/\/images\.unsplash\.com\/(photo-[a-zA-Z0-9-]+)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(data)) !== null) {
          if (!matches.includes(match[1])) {
            matches.push(match[1]);
          }
        }
        resolve(matches.slice(0, 15));
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
};

const run = async () => {
  try {
    console.log("Searching for indian saree photo IDs...");
    const sareePhotos = await searchUnsplash("indian-saree");
    console.log("Saree Photo IDs:", sareePhotos);

    console.log("Searching for indian suit fashion photo IDs...");
    const suitPhotos = await searchUnsplash("indian-fashion");
    console.log("Suit/Fashion Photo IDs:", suitPhotos);
  } catch (err) {
    console.error(err);
  }
};

run();
