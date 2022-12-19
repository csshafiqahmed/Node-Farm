const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");

const replaceTemplate = require("./modules/replaceTemplate");

////////////////////////////////////////////////////////////////////////////////
//Files Reading and Writing
//Blocking Synchronous Way
/*const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}.\n Created on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOut);

console.log('File has been written');*/

//Non Blocking Asynchronous way by using callback functions
/*fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
                console.log("Your Files has been written");
            });
        });
    });
});
console.log('Will Read File');*/
////////////////////////////////////////////////////////////////////////////////
//Server

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const productData = JSON.parse(data);

const slugs = productData.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, resp) => {
  const { query, pathname } = url.parse(req.url, true);

  //overview page
  if (pathname === "/" || pathname === "/overview") {
    resp.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = productData
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARD%}", cardsHtml);
    //console.log(cardsHtml);
    resp.end(output);

    //product page
  } else if (pathname === "/product") {
    resp.writeHead(200, { "Content-type": "text/html" });
    const product = productData[query.id];
    const output = replaceTemplate(tempProduct, product);
    resp.end(output);

    //api page
  } else if (pathname === "/api") {
    resp.writeHead(200, { "Content-type": "application/json" });
    resp.end(data);

    //not found page
  } else {
    resp.writeHead(404, {
      "Content-type": "text/html",
    });
    resp.end("<h1>Page not found</h1>");
  }
  //resp.end('Hello from the server');
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to request on port 8000");
});
