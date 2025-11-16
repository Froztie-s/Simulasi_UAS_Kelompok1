from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Product, Cart, CartItem
from .serializers import (
    UserSerializer, ProductSerializer, CartSerializer, 
    CartItemSerializer, MyTokenObtainPairSerializer
)
from .permissions import IsSellerOrReadOnly
from rest_framework_simplejwt.views import TokenObtainPairView as SimpleJWTTokenObtainPairView

# View for User Registration (POST)
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# Custom Token View to use the custom serializer
class MyTokenObtainPairView(SimpleJWTTokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ViewSet for Products (CRUD for Sellers, R for Customers)
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Products.
    - Sellers can: Create, Retrieve, Update, Delete
    - Customers can: Retrieve (List and Detail)
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly] # Use custom permission

    def get_queryset(self):
        """
        Optionally filter products by seller if 'my_products' param is set.
        """
        queryset = Product.objects.all()
        if self.request.user.is_authenticated and self.request.user.profile.role == 'seller':
            my_products = self.request.query_params.get('my_products', None)
            if my_products is not None:
                return queryset.filter(seller=self.request.user)
        return queryset

    def perform_create(self, serializer):
        # Automatically set the seller to the currently logged-in user
        serializer.save(seller=self.request.user)

# View for managing the User's Cart (GET, PATCH)
class CartView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve, or update the user's cart.
    - GET: Returns the user's cart.
    - PATCH: Adds/updates/removes an item. Expects:
      { "product_id": X, "quantity": Y }
      (Setting quantity to 0 removes the item)
    """
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated] # Must be logged in

    def get_object(self):
        # Retrieve the cart for the currently authenticated user
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    # Use PATCH to add/update/remove items
    def patch(self, request, *args, **kwargs):
        cart = self.get_object()
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')

        if product_id is None or quantity is None:
            return Response({"error": "product_id and quantity are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return Response({"error": "Quantity must be a valid integer"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Validation: Customers cannot add their own products to the cart
        if product.seller == request.user:
            return Response({"error": "You cannot add your own product to your cart"}, status=status.HTTP_400_BAD_REQUEST)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 0} # Default to 0, then update
        )

        if quantity <= 0:
            if not created: # Only delete if it existed
                cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()

        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
