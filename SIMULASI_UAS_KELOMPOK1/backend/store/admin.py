from django.contrib import admin
from .models import Profile, Product, Cart, CartItem

admin.site.register(Profile)
admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(CartItem)
