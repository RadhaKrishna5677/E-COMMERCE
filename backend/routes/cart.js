const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");


const isAuthenticated = (req, res, next) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Login first" });
  }
  req.userId = userId;
  next(); // 
};


router.get("/", isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId })
      .populate("items.product");

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    return res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/add", isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return res.status(200).json({ message: "Product added to cart", cart });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
