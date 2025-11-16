import { useState, useEffect } from "react";
import { apiClient } from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import "./ProductListPage.css";

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDemoData, setIsDemoData] = useState(false);
  const { token, role } = useAuth();

  // Dummy products for customer demo
  const dummyProducts = [
    {
      id: 1,
      name: "Wireless Headphones",
      description:
        "Premium noise-cancelling wireless headphones with 30-hour battery life",
      price: "199.99",
      seller: "TechStore",
      image_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Smart Watch Pro",
      description:
        "Fitness tracking smartwatch with heart rate monitor and GPS",
      price: "299.99",
      seller: "FitGear",
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Laptop Stand",
      description: "Ergonomic aluminum laptop stand with adjustable height",
      price: "49.99",
      seller: "OfficeEssentials",
      image_url:
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      name: "Mechanical Keyboard",
      description: "RGB backlit mechanical keyboard with Cherry MX switches",
      price: "149.99",
      seller: "GamersHub",
      image_url:
        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      name: "Portable Charger",
      description: "20000mAh power bank with fast charging and dual USB ports",
      price: "39.99",
      seller: "PowerUp",
      image_url:
        "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      price: "29.99",
      seller: "TechStore",
      image_url:
        "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop",
    },
    {
      id: 7,
      name: "USB-C Hub",
      description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader",
      price: "59.99",
      seller: "OfficeEssentials",
      image_url:
        "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=300&fit=crop",
    },
    {
      id: 8,
      name: "Webcam HD",
      description: "1080p HD webcam with built-in microphone for video calls",
      price: "79.99",
      seller: "TechStore",
      image_url:
        "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=400&h=300&fit=crop",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        setIsDemoData(false);
        const response = await apiClient.get("/products/");

        let fetchedProducts = [];
        // Check if data is paginated
        if (response.data.results) {
          fetchedProducts = response.data.results;
        } else if (Array.isArray(response.data)) {
          fetchedProducts = response.data;
        }

        // If we have real products, use them
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          setIsDemoData(false);
        } else {
          // Only use dummy products if no real products exist
          setProducts(dummyProducts);
          setIsDemoData(true);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // Use dummy products if API fails
        setProducts(dummyProducts);
        setIsDemoData(true);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    try {
      const response = await apiClient.patch("/cart/", {
        product_id: productId,
        quantity: 1,
      });
      alert("✅ Product added to cart successfully!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      console.error("Error response:", err.response?.data);

      // Check for specific error messages
      if (err.response?.data?.error) {
        const errorMsg = err.response.data.error;

        if (errorMsg === "Product not found") {
          alert(
            "⚠️ This is a demo product. Please add real products from the seller dashboard to test the cart feature."
          );
        } else if (errorMsg.includes("cannot add your own product")) {
          alert("⚠️ You cannot add your own products to the cart.");
        } else {
          alert(`❌ ${errorMsg}`);
        }
      } else if (err.response?.status === 401) {
        alert("🔒 Please log in to add items to your cart.");
      } else {
        alert("❌ Failed to add to cart. Please try again.");
      }
    }
  };

  // Loading State
  if (loading) {
    return (
      <Container className="mt-4">
        <div className="loading-container">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="loading-spinner"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="loading-text">Loading awesome products...</p>
        </div>
      </Container>
    );
  }

  // Error State
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger" className="custom-alert custom-alert-danger">
          <Alert.Heading>❌ Oops! Something went wrong</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ minHeight: "100vh", width: "100vw" }}>
      {/* Page Header */}
      <div className="products-header text-center">
        <Container>
          <h1>🛍️ Products</h1>
          <p>Discover amazing products from our sellers</p>
        </Container>
      </div>

      {/* Demo Data Warning */}
      {isDemoData && (
        <Alert
          variant="warning"
          className="mb-4"
          style={{ borderRadius: "16px", border: "none" }}
        >
          <Alert.Heading>ℹ️ Demo Mode</Alert.Heading>
          <p className="mb-0">
            You're viewing demo products. These cannot be added to cart.
            {role === "seller" &&
              " Please add real products from the Manage Products page."}
            {role === "customer" &&
              " Please wait for sellers to add real products."}
          </p>
        </Alert>
      )}

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h2 className="empty-state-title">No Products Available</h2>
          <p className="empty-state-text">
            There are currently no products to display. Please check back later!
          </p>
        </div>
      ) : (
        <Row>
          {products.map((product, index) => (
            <Col
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="mb-4 product-col"
              key={product.id}
            >
              <Card className="product-card">
                <div className="product-card-img-wrapper">
                  {isDemoData && (
                    <div
                      style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background:
                          "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        boxShadow: "0 4px 10px rgba(251, 191, 36, 0.3)",
                        zIndex: 1,
                      }}
                    >
                      DEMO
                    </div>
                  )}
                  <Card.Img
                    variant="top"
                    src={
                      product.image_url ||
                      "https://placehold.co/400x300/6f42c1/white?text=No+Image"
                    }
                    alt={product.name}
                    className="product-card-img"
                  />
                </div>
                <Card.Body className="product-card-body d-flex flex-column">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-seller">
                    <span className="product-seller-icon">👤</span>
                    Sold by: {product.seller}
                  </p>
                  <p className="product-description">{product.description}</p>
                  <h2 className="product-price">${product.price}</h2>

                  {/* Action Button - Only visible for logged-in customers */}
                  {token && role === "customer" ? (
                    <div className="mt-auto">
                      <Button
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isDemoData}
                        style={
                          isDemoData
                            ? {
                                opacity: 0.6,
                                cursor: "not-allowed",
                                background:
                                  "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
                              }
                            : {}
                        }
                        title={
                          isDemoData
                            ? "Demo products cannot be added to cart"
                            : "Add to cart"
                        }
                      >
                        <span className="cart-icon">🛒</span>
                        {isDemoData ? "Demo Only" : "Add to Cart"}
                      </Button>
                    </div>
                  ) : !token ? (
                    <div className="mt-auto">
                      <div className="login-prompt">
                        <a href="/login">Login</a> to add items to cart
                      </div>
                    </div>
                  ) : null}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default ProductListPage;
