const http = require("https");

const urls = [
  "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1600",
  "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=1600",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1600",
  "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?q=80&w=1600"
];

const checkUrl = (url) => {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on("error", () => {
      resolve({ url, status: 500 });
    });
  });
};

Promise.all(urls.map(checkUrl)).then((results) => {
  results.forEach((r) => {
    console.log(r.status, r.url);
  });
});
