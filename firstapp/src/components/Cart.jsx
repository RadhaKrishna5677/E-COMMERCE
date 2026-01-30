import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const userId = localStorage.getItem("userId")

  useEffect(() => {
    if (!userId) {
      alert("Login first")
      navigate("/login")
    } else {
      fetchCart()
    }
  }, [userId, navigate])

  // 🔹 Fetch cart items
  function fetchCart() {
    axios
      .get("http://localhost:4000/api/cart", {
        params: { userId },
      })
      .then((res) => {
        if (res.status === 200) {
          setCartItems(res.data.items || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        console.log("Error fetching cart", err)
        setLoading(false)
      })
  }

  // 🔹 Remove item from cart
  function removeFromCart(productId) {
    axios
      .delete("http://localhost:4000/api/cart/remove", {
        params: { userId, productId },
      })
      .then(() => {
        alert("Item removed from cart")
        fetchCart()
      })
      .catch((err) => {
        console.log("Remove cart error", err)
      })
  }

  // 🔹 Increase / Decrease quantity
  function updateQuantity(productId, quantity) {
    if (quantity < 1) return

    axios
      .put("http://localhost:4000/api/cart/update", {
        userId,
        productId,
        quantity,
      })
      .then(() => {
        fetchCart()
      })
      .catch((err) => {
        console.log("Update quantity error", err)
      })
  }

  return (
    <div className="container mt-4">
      <h2>Your Cart</h2>

      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4 mt-3">
          {cartItems.map((item, index) => {
            if (!item.product) return null   // 🛡 prevents crash

            return (
              <div className="col" key={item.product._id || index}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">
                      {item.product.name}
                    </h5>

                    <p><b>Price:</b> ₹{item.product.price}</p>
                    <p><b>Quantity:</b> {item.quantity}</p>

                    <p>
                      <b>Total:</b> ₹{item.product.price * item.quantity}
                    </p>

                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                    >
                      -
                    </button>

                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        removeFromCart(item.product._id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
