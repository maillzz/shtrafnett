from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Complaint, LegalComplaint

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['phone', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            phone=validated_data['phone'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = User.objects.filter(phone=data['phone']).first()
        if user and user.check_password(data['password']):
            return user
        raise serializers.ValidationError("Invalid phone or password")

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            'id', 'user', 'client_full_name', 'resolution_number', 'resolution_date', 'issuing_authority',
            'received_date', 'violation_date', 'violation_time', 'violation_address',
            'car_model', 'car_plate', 'detection_method', 'photo', 'fine_amount',
            'controller_name', 'parking_number', 'serial_number', 'certificate_number',
            'pdf_file', 'created_at', 'status'
        ]

class LegalComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalComplaint
        fields = ['company_name', 'company_phone', 'attachment', 'created_at', 'user', 'status'] 