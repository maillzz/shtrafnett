from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=15, blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    email = models.EmailField(('email address'), unique=True)

    def __str__(self):
        return self.username