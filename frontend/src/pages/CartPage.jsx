import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/axiosConfig";
import {
  ListGroup,
  Button,
  Alert,
  Spinner,
  Form,
  Card,
  Row,
  Col,
} from "react-bootstrap";

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/cart/");
      setCart(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError("Could not load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    const quantity = parseInt(newQuantity);

    if (isNaN(quantity) || quantity < 0) {
      return;
    }

    try {
      const response = await apiClient.patch("/cart/", {
        product_id: productId,
        quantity: quantity,
      });
      setCart(response.data);
    } catch (err) {
      console.error("Failed to update quantity:", err);
      alert("Failed to update cart.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!cart || cart.items.length === 0) {
    return <Alert variant="info">Your cart is empty.</Alert>;
  }

  const totalPrice = cart.items.reduce((total, item) => {
    return total + parseFloat(item.product.price) * item.quantity;
  }, 0);

  return (
    <div>
      <h2 className="mb-4">My Cart</h2>

      <Row>
        <Col lg={8}>
          <ListGroup>
            {cart.items.map((item) => (
              <ListGroup.Item key={item.id}>
                <Row className="align-items-center">
                  <Col xs={3} md={2}>
                    <img
                      src={
                        item.product.image_url ||
                        "https://placehold.co/100x100?text=No+Image"
                      }
                      alt={item.product.name}
                      className="img-fluid rounded"
                      style={{ maxHeight: "100px", objectFit: "cover" }}
                    />
                  </Col>
                  <Col xs={9} md={4}>
                    <h5>{item.product.name}</h5>
                    <p className="text-muted mb-0">
                      ${item.product.price} each
                    </p>
                  </Col>
                  <Col xs={6} md={3} className="mt-2 mt-md-0">
                    <Form.Group>
                      <Form.Label className="small">Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.product.id, e.target.value)
                        }
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6} md={3} className="text-end mt-2 mt-md-0">
                    <h6 className="mb-2">
                      $
                      {(parseFloat(item.product.price) * item.quantity).toFixed(
                        2
                      )}
                    </h6>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleUpdateQuantity(item.product.id, 0)}
                    >
                      Remove
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong className="text-primary">
                  ${totalPrice.toFixed(2)}
                </strong>
              </div>
              <Button
                variant="success"
                className="w-100"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default CartPage;
