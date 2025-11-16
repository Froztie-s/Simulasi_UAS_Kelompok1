from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, Cart, CartItem, Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Serializer for User Registration
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=Profile.USER_ROLE_CHOICES, write_only=True, source='profile.role')

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        role = profile_data.get('role', 'customer')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Set the role on the user's profile (profile is created by signal)
        user.profile.role = role
        user.profile.save()
        return user

# Serializer for Products
class ProductSerializer(serializers.ModelSerializer):
    seller = serializers.ReadOnlyField(source='seller.username')

    class Meta:
        model = Product
        fields = ('id', 'seller', 'name', 'description', 'price', 'image_url')

# Serializers for Cart
class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True) # Nested serializer
    product_id = serializers.IntegerField(write_only=True) # For adding new items

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'quantity', 'product_id')

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'user', 'created_at', 'items')

# Custom Token Serializer to include user's role
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['role'] = user.profile.role  # Add the user's role

        return token
