from rest_framework import permissions

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow sellers to edit (create, update, delete) products.
    Read-only access is allowed for everyone.
    """

    def has_permission(self, request, view):
        # Allow read-only methods (GET, HEAD, OPTIONS) for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Check if user is authenticated and has the 'seller' role for write methods
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'seller'

    def has_object_permission(self, request, view, obj):
        """
        Allow read-only methods for everyone.
        For write methods, only allow the seller who owns the product.
        """
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the seller who owns the product.
        return obj.seller == request.user
