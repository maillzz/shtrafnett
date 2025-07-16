from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('The Phone field must be set')
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    phone = models.CharField(max_length=15, unique=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.phone

class Complaint(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    client_full_name = models.CharField(max_length=255)
    resolution_number = models.CharField(max_length=100)
    resolution_date = models.DateField()
    issuing_authority = models.CharField(max_length=255)
    received_date = models.DateField()
    violation_date = models.DateField()
    violation_time = models.TimeField()
    violation_address = models.CharField(max_length=255)
    car_model = models.CharField(max_length=100)
    car_plate = models.CharField(max_length=10)
    detection_method = models.CharField(max_length=100)
    photo = models.FileField(upload_to='complaint_photos/', null=True, blank=True)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2)
    controller_name = models.CharField(max_length=100)
    parking_number = models.CharField(max_length=50)
    serial_number = models.CharField(max_length=50)
    certificate_number = models.CharField(max_length=50)
    pdf_file = models.FileField(upload_to='complaints_pdfs/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    
    STATUS_CHOICES = [
        ('pending', 'В обработке'),
        ('accepted', 'Принято'),
        ('rejected', 'Отклонено'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Статус жалобы'
    )



    def __str__(self):
        return f"Complaint {self.resolution_number} by {self.user.phone}"
    


class LegalComplaint(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    company_phone = models.CharField(max_length=20)
    attachment = models.FileField(upload_to='legal_attachments/')
    created_at = models.DateTimeField(auto_now_add=True)

    
    STATUS_CHOICES = [
        ('pending', 'В обработке'),
        ('accepted', 'Принято'),
        ('rejected', 'Отклонено'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Статус жалобы'

    )

    def __str__(self):
        return f"{self.company_name} — {self.company_phone}"


