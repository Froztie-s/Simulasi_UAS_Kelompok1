import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import ProductListPage from "./pages/ProductListPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import ManageProductsPage from "./pages/ManageProductsPage";
import PaymentPage from "./pages/PaymentPage";
import { useAuth } from "./context/AuthContext";

// Helper component for protected routes
function ProtectedRoute({ children, allowedRoles }) {
  const { token, role } = useAuth();

  if (!token) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in, but wrong role, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

// Helper component for public routes (login/register)
function PublicRoute({ children }) {
  const { token } = useAuth();

  if (token) {
    // Already logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { token, logout, role, user } = useAuth();
  const location = useLocation();

  const fullScreenRoutes = ["/login", "/register", "/manage-products"];
  const hideNavbar = fullScreenRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideNavbar && (
        <Navbar bg="dark" variant="dark" expand="lg" className="w-100">
          <Container fluid className="px-4">
            <Navbar.Brand as={Link} to="/">
              E-Commerce
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                  Products
                </Nav.Link>
                {token && role === "customer" && (
                  <Nav.Link as={Link} to="/cart">
                    My Cart
                  </Nav.Link>
                )}
                {token && role === "seller" && (
                  <Nav.Link as={Link} to="/manage-products">
                    Manage My Products
                  </Nav.Link>
                )}
              </Nav>
              <Nav>
                {token ? (
                  <>
                    <Navbar.Text className="me-3">
                      Hi, {user} ({role})
                    </Navbar.Text>
                    <Button variant="outline-light" size="sm" onClick={logout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login">
                      Login
                    </Nav.Link>
                    <Nav.Link as={Link} to="/register">
                      Register
                    </Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      <Container className={hideNavbar ? "p-0" : "mt-4"} fluid={hideNavbar}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["customer", "seller"]}>
                <ProductListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-products"
            element={
              <ProtectedRoute allowedRoles={["seller"]}>
                <ManageProductsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
