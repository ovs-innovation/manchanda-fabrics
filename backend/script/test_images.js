const http = require("https");

const urls = [
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1600",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1600",
  "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?q=80&w=1600",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1600",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1600",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1600",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600"
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
