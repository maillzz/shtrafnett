from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Complaint
from django.utils.html import format_html
from .models import LegalComplaint

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'phone', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('phone',)
    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'password1', 'password2'),
        }),
    )
    ordering = ('phone',)



@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_phone', 'resolution_number',
        'resolution_date', 'created_at', 'pdf_link', 'client_full_name', 'photo_link', 'status'
    )
    list_filter = ('resolution_date', 'violation_date')
    search_fields = ('resolution_number', 'user__phone', 'client_full_name')
    list_editable = ('status',)
    fields = (
        'user', 'resolution_number', 'resolution_date', 'issuing_authority',
        'client_full_name',
        'received_date', 'violation_date', 'violation_time',
        'violation_address', 'car_model', 'car_plate', 'detection_method',
        'photo', 'fine_amount',  'controller_name', 'parking_number',
        'serial_number', 'certificate_number', 'pdf_file', 'status'
    )

    def user_phone(self, obj):
        return obj.user.phone
    user_phone.short_description = 'User Phone'

    def pdf_link(self, obj):
        if obj.pdf_file:
            return format_html(
                '<a href="{}" download>📄 Скачать PDF</a>',
                obj.pdf_file.url
            )
        return "—"
    pdf_link.short_description = "PDF"

    def photo_link(self, obj):
            if obj.photo:
                return format_html(
                    '<a href="{}" download>🖼 Скачать фото</a>',
                    obj.photo.url
                )
            return "—"
    photo_link.short_description = "Фото"



@admin.register(LegalComplaint)
class LegalComplaintAdmin(admin.ModelAdmin):
    list_display = ('id', 'company_name', 'company_phone', 'status', 'created_at', 'attachment_link')
    search_fields = ('company_name', 'company_phone')
    list_editable = ('status',)

    def attachment_link(self, obj):
        if obj.attachment:
            return format_html('<a href="{}" download>📎 Скачать</a>', obj.attachment.url)
        return "—"
    attachment_link.short_description = "Файл"
