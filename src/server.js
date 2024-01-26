require("dotenv").config();

const { MongoClient } = require("mongodb");
const express = require("express");

async function serve() {
  const client = new MongoClient(process.env.DATABASE_URI);

  await client.connect();
  const db = client.db("fsv-db");

  const app = express();
  app.use(express.json());

  app.get("/products", async (req, res) => {
    const products = await db.collection("product").find({}).toArray();
    res.send(products);
  });

  async function populatedCartIds(ids) {
    return Promise.all(
      ids.map((id) => db.collection("product").findOne({ id }))
    );
  }

  app.get("/users/:userId/cart", async (req, res) => {
    const user = await db.collection("user").findOne({ id: req.params.userId });
    const populatedCart = await populatedCartIds(user.cartItem);
    res.json(populatedCart);
  });

  app.get("/products/:productId", async (req, res) => {
    const productId = req.params.productId;
    const product = await db.collection("product").findOne({ id: productId });
    res.json(product);
  });

  app.post("/users/:userId/cart", async (req, res) => {
    const userId = req.params.userId;
    const productId = req.body.id;

    await db.collection("user").updateOne(
      { id: userId },
      {
        $addToSet: { cartItem: productId },
      }
    );

    const user = await db.collection("user").findOne({ id: req.params.userId });
    const populatedCart = await populatedCartIds(user.cartItem);
    res.json(populatedCart);
  });

  app.delete("/users/:userId/cart/:productId", async (req, res) => {
    const productId = req.params.productId;
    const userId = req.params.userId

    await db.collection("user").updateOne(
      { id: userId },
      {
        $pull: { cartItem: productId },
      }
    );

    const user = await db.collection("user").findOne({ id: req.params.userId });
    const populatedCart = await populatedCartIds(user.cartItem);
    res.json(populatedCart);
  });

  app.listen(8000, () => {
    console.log("Server is listening on port 8000");
  });
}

serve();
