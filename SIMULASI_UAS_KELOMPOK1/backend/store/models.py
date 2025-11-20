from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    USER_ROLE_CHOICES = (
        ('customer', 'Customer'),
        ('seller', 'Seller'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=USER_ROLE_CHOICES, default='customer')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"

# Signal to create a Profile and Cart when a new User is created
@receiver(post_save, sender=User)
def create_user_profile_and_cart(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        Cart.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # This check ensures we don't get into a recursion loop
    # and handles cases where the profile might not be created yet.
    # A more robust way is to check if 'profile' is in instance.__dict__
    try:
        instance.profile.save()
    except Profile.DoesNotExist:
        # This can happen during superuser creation via command line
        Profile.objects.create(user=instance)
        # We assume superusers are sellers, or you can set a default
        instance.profile.role = 'seller' 
        instance.profile.save()
    except AttributeError:
        # This can happen if the profile isn't attached yet
        Profile.objects.create(user=instance)
        instance.profile.save()


class Product(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True) # Using a URL for simplicity

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart.user.username}'s cart"
