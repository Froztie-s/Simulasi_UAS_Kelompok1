from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserCreateView, ProductViewSet, CartView

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('register/', UserCreateView.as_view(), name='register'),
    path('cart/', CartView.as_view(), name='cart'),
    path('', include(router.urls)),
]