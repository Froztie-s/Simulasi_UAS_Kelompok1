import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/axiosConfig";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  ListGroup,
  Spinner,
} from "react-bootstrap";

function PaymentPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty. Add items before checking out.");
      return;
    }

    setSuccessMessage("Payment processed! (demo)");

    setFormData({
      fullName: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
    });
    setTimeout(() => navigate("/"), 2000);
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
    return (
      <Alert variant="info">
        Your cart is empty. <Button variant="link" onClick={() => navigate("/")}>Go shop</Button>
      </Alert>
    );
  }

  const totalPrice = cart.items.reduce((total, item) => {
    return total + parseFloat(item.product.price) * item.quantity;
  }, 0);

  return (
    <div>
      <h2 className="mb-4">Payment</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Row>
        <Col lg={7} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Billing & Payment Details</Card.Title>
              <hr />
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="fullName">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="email">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group controlId="city">
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="postalCode">
                      <Form.Label>Postal Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="cardNumber">
                      <Form.Label>Card Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="expiry">
                      <Form.Label>Expiry</Form.Label>
                      <Form.Control
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId="cvv">
                      <Form.Label>CVV</Form.Label>
                      <Form.Control
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="success" size="lg" className="w-100">
                  Pay ${totalPrice.toFixed(2)}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <hr />
              <ListGroup variant="flush">
                {cart.items.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{item.product.name}</strong>
                      <div className="text-muted small">
                        Qty: {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong className="text-primary">${totalPrice.toFixed(2)}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PaymentPage;
