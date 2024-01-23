const express = require("express");
let { cartItems } = require("./temp-data");
let { products } = require("./temp-data");

const app = express();
app.use(express.json());

app.get("/products", (req, res) => {
  res.json(products);
});

function populatedCartIds(ids) {
  return ids.map((id) => products.find((product) => product.id === id));
}

app.get("/cart", (req, res) => {
  const populatedCart = populatedCartIds(cartItems)
  res.json(populatedCart);
});

app.get("/products/:productId", (req, res) => {
  const productId = req.params.productId;
  const product = products.find((product) => product.id === productId);
  res.json(product);
});

app.post("/cart", (req, res) => {
  const productId = req.body.id;
  cartItems.push(productId);
  const populatedCart = populatedCartIds(cartItems)
  res.json(populatedCart);
});

app.delete("/cart/:productId", (req, res) => {
  const productId = req.params.productId;
  cartItems = cartItems.filter((id) => id !== productId);
  const populatedCart = populatedCartIds(cartItems);
  res.json(populatedCart);
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
