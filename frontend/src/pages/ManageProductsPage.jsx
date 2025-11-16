import { useState, useEffect } from "react";
import { apiClient } from "../api/axiosConfig";
import {
  Table,
  Button,
  Alert,
  Spinner,
  Form,
  Card,
  Dropdown,
  ButtonGroup,
  Badge,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import "./ManageProductsPage.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Product Form Component
function ProductForm({ product, onSave, onCancel }) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price || "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: parseFloat(price),
      image_url: imageUrl,
    });
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>
          {product ? "Edit Product" : "Create New Product"}
        </Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formProductName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formProductDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formProductPrice">
            <Form.Label>Price ($)</Form.Label>
            <Form.Control
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formProductImageUrl">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex gap-2">
            <Button variant="primary" type="submit">
              Save
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

function ManageProductsPage() {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null); // null, 'new', or a product object
  const [error, setError] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productStatuses, setProductStatuses] = useState({});

  // Get username from JWT token
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || "Seller");
      } catch (error) {
        console.error("Error decoding token:", error);
        setUsername("Seller");
      }
    }
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/products/?my_products=true");
      setMyProducts(response.data.results || response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Could not load your products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  useEffect(() => {
    setProductStatuses((prev) => {
      const updated = {};
      myProducts.forEach((product) => {
        updated[product.id] = prev?.[product.id] ?? true;
      });
      return updated;
    });
  }, [myProducts]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedProducts(new Set());
  }, [entriesToShow, searchTerm, myProducts.length]);

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct === "new") {
        // Create new product
        await apiClient.post("/products/", productData);
      } else {
        // Update existing product
        await apiClient.put(`/products/${editingProduct.id}/`, productData);
      }
      setEditingProduct(null);
      fetchMyProducts(); // Refresh the list
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Failed to save product. Please try again.");
    }
  };

  const handleDeleteProduct = async (
    productId,
    { skipConfirm = false, refresh = true } = {}
  ) => {
    if (
      !skipConfirm &&
      !window.confirm("Are you sure you want to delete this product?")
    ) {
      return;
    }

    try {
      await apiClient.delete(`/products/${productId}/`);
      if (refresh) {
        fetchMyProducts(); // Refresh the list
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Failed to delete product.");
    }
  };

  const filteredProducts = myProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / entriesToShow)
  );
  const startIndex = (currentPage - 1) * entriesToShow;
  const displayedProducts = filteredProducts.slice(
    startIndex,
    startIndex + entriesToShow
  );

  const showingStart = filteredProducts.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(
    filteredProducts.length,
    startIndex + displayedProducts.length
  );

  const allDisplayedSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every((product) => selectedProducts.has(product.id));

  const hasSelection = selectedProducts.size > 0;

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (allDisplayedSelected) {
        displayedProducts.forEach((product) => next.delete(product.id));
      } else {
        displayedProducts.forEach((product) => next.add(product.id));
      }
      return next;
    });
  };

  const handleEntriesChange = (event) => {
    setEntriesToShow(Number(event.target.value));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleToggleStatus = (productId) => {
    setProductStatuses((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleBulkDelete = async () => {
    if (!hasSelection) return;
    if (!window.confirm("Delete all selected products?")) return;

    const ids = Array.from(selectedProducts);
    for (const id of ids) {
      await handleDeleteProduct(id, { skipConfirm: true, refresh: false });
    }
    await fetchMyProducts();
    setSelectedProducts(new Set());
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const pagesToShow = new Set([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const paginationItems = [];
  let lastPage = 0;
  [...pagesToShow]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .forEach((page) => {
      if (page - lastPage > 1) {
        paginationItems.push(
          <Pagination.Ellipsis
            key={`ellipsis-${page}`}
            disabled
            className="pagination-ellipsis"
          />
        );
      }
      paginationItems.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
      lastPage = page;
    });

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>🛍️ Seller Dashboard</h3>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <i className="bi bi-grid"></i>
            <span>My Products</span>
          </div>

          <div
            className="nav-item"
            onClick={() => setEditingProduct("new")}
            style={{
              cursor: editingProduct !== null ? "not-allowed" : "pointer",
              opacity: editingProduct !== null ? 0.6 : 1,
            }}
          >
            <i className="bi bi-plus-circle"></i>
            <span>Add New Product</span>
          </div>

          <div className="nav-item">
            <i className="bi bi-cart"></i>
            <span>Orders</span>
          </div>

          <div className="nav-item">
            <i className="bi bi-graph-up"></i>
            <span>Analytics</span>
          </div>

          <div className="nav-item">
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {username?.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="user-details">
              <div className="user-name">{username || "Seller"}</div>
              <div className="user-role">Seller Account</div>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              window.location.href = "/login";
            }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <div className="content-stack">
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="dashboard-header-card">
            <div className="header-left">
              <div className="icon-circle">
                <i className="bi bi-box-seam"></i>
              </div>
              <div>
                <p className="eyebrow-text">Product Center</p>
                <h1>Product List</h1>
                <p className="subtext">
                  Keep every item organized with a clean, modern workspace.
                </p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-card">
                <p className="stat-label">Active Products</p>
                <h3>{filteredProducts.length}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Pending Reviews</p>
                <h3>04</h3>
              </div>
            </div>
          </div>

          <div className="dashboard-toolbar">
            <div className="toolbar-actions">
              <Button
                className="action-button add"
                onClick={() => setEditingProduct("new")}
                disabled={editingProduct !== null}
              >
                <i className="bi bi-plus-circle"></i>
                Add
              </Button>
              <Button
                className="action-button delete"
                onClick={handleBulkDelete}
                disabled={!hasSelection}
              >
                <i className="bi bi-trash3"></i>
                Delete
              </Button>
              <Dropdown as={ButtonGroup} className="split-dropdown">
                <Button className="action-button neutral">Action</Button>
                <Dropdown.Toggle
                  className="action-button neutral"
                  split
                  id="action-split"
                />
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={fetchMyProducts}>
                    Refresh List
                  </Dropdown.Item>
                  <Dropdown.Item disabled={!hasSelection}>
                    Duplicate Selected
                  </Dropdown.Item>
                  <Dropdown.Item disabled>
                    Export CSV (coming soon)
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="toolbar-filters">
              <div className="entries-select">
                <span>Show</span>
                <Form.Select
                  value={entriesToShow}
                  onChange={handleEntriesChange}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Form.Select>
                <span>entries</span>
              </div>
              <InputGroup className="search-input">
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search products"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup>
            </div>
          </div>

          {editingProduct && (
            <div className="form-panel">
              <ProductForm
                product={editingProduct === "new" ? null : editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          )}

          <div className="table-card">
            {displayedProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-box"></i>
                </div>
                <h3>No products to show</h3>
                <p>
                  {myProducts.length === 0
                    ? "You haven't created any products yet."
                    : "Try adjusting your search or filters."}
                </p>
                <Button
                  className="action-button add"
                  onClick={() => setEditingProduct("new")}
                >
                  Create Product
                </Button>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table
                    hover
                    responsive
                    className="product-table align-middle mb-0"
                  >
                    <thead>
                      <tr>
                        <th className="checkbox-column">
                          <Form.Check
                            type="checkbox"
                            checked={
                              displayedProducts.length > 0 &&
                              allDisplayedSelected
                            }
                            onChange={toggleSelectAll}
                            disabled={displayedProducts.length === 0}
                          />
                        </th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Permissions</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedProducts.map((product) => {
                        const isActive = productStatuses[product.id] ?? true;
                        return (
                          <tr key={product.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedProducts.has(product.id)}
                                onChange={() =>
                                  toggleProductSelection(product.id)
                                }
                              />
                            </td>
                            <td>
                              <img
                                src={
                                  product.image_url ||
                                  "https://placehold.co/60x60?text=No+Image"
                                }
                                alt={product.name}
                                className="table-thumb"
                              />
                            </td>
                            <td>
                              <div className="product-info">
                                <div className="product-name">
                                  {product.name}
                                </div>
                                <div className="product-description">
                                  {product.description ||
                                    "No description provided"}
                                </div>
                              </div>
                            </td>
                            <td className="price-cell">
                              ${Number(product.price).toFixed(2)}
                            </td>
                            <td>
                              <div className="status-toggle">
                                <Form.Check
                                  type="switch"
                                  id={`status-${product.id}`}
                                  checked={isActive}
                                  onChange={() =>
                                    handleToggleStatus(product.id)
                                  }
                                />
                                <span
                                  className={`status-label ${
                                    isActive ? "active" : "inactive"
                                  }`}
                                >
                                  {isActive ? "Active" : "Paused"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="permission-badges">
                                <Badge bg="light" text="dark">
                                  Read
                                </Badge>
                                <Badge bg="primary" className="soft-badge">
                                  Edit
                                </Badge>
                                <Badge bg="danger" className="soft-badge">
                                  Delete
                                </Badge>
                              </div>
                            </td>
                            <td>
                              <div className="row-actions">
                                <button
                                  className="icon-button edit"
                                  onClick={() => setEditingProduct(product)}
                                  disabled={editingProduct !== null}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="icon-button delete"
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>

                <div className="table-footer">
                  <p>
                    Showing {showingStart}-{showingEnd} of{" "}
                    {filteredProducts.length} entries
                  </p>
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                    />
                    {paginationItems}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                    />
                  </Pagination>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageProductsPage;
