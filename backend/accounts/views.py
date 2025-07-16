from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, ComplaintSerializer, LegalComplaintSerializer
from django.http import FileResponse
from django.core.files.storage import default_storage
from django.utils import timezone
from .models import Complaint, LegalComplaint
from .serializers import ComplaintSerializer
from .pdf_generator import create_document_with_playwright

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.utils import timezone
from django.conf import settings

import os
import asyncio
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class SubmitComplaintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        user = request.user

        required_fields = [
            'resolution_number', 'resolution_date', 'issuing_authority', 'received_date',
            'violation_date', 'violation_time', 'violation_address', 'car_model', 'car_plate',
            'detection_method', 'fine_amount', 'controller_name', 'parking_number',
            'serial_number', 'certificate_number'
        ]
        for field in required_fields:
            if not data.get(field):
                return Response({'error': f'Поле {field} обязательно'}, status=status.HTTP_400_BAD_REQUEST)

        data['user'] = user.id
        serializer = ComplaintSerializer(data=data)

        if serializer.is_valid():
            complaint = serializer.save()

            output_filename = f"complaints_pdfs/complaint_{complaint.id}.pdf"
            full_output_path = os.path.join(settings.MEDIA_ROOT, output_filename)
            template_path = os.path.join(settings.BASE_DIR, "template.html")

            context_data = {
                'court_name': "Тверской районный суд",
                'court_address': "127051, г. Москва, Цветной б-р, д. 25А",
                'client_fio': complaint.client_full_name or user.phone,
                'client_address_phone': user.phone,
                'controller_fio': complaint.controller_name,
                'case_number': complaint.resolution_number,
                'resolution_date': str(complaint.resolution_date),
                'violation_datetime': f"{complaint.violation_date} в {complaint.violation_time}",
                'parking_lot_number': complaint.parking_number,
                'violation_address': complaint.violation_address,
                'car_model_plate': f"{complaint.car_model} {complaint.car_plate}",
                'fine_amount': f"{complaint.fine_amount} рублей",
                'device_serial': complaint.serial_number,
                'certificate_number': complaint.certificate_number,
                'submission_date': timezone.now().strftime("%d.%m.%Y")
            }

            try:
                asyncio.run(
                    create_document_with_playwright(
                        context_data,
                        template_path=template_path,
                        output_filename=full_output_path
                    )
                )
            except Exception as e:
                return Response({'error': f'Ошибка генерации PDF: {str(e)}'}, status=500)

            complaint.pdf_file.name = output_filename
            complaint.save()

            return Response({
                'message': 'Жалоба успешно отправлена',
            }, status=201)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token or logout failed'}, status=status.HTTP_400_BAD_REQUEST)

class DownloadPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, complaint_id):
        try:
            complaint = Complaint.objects.get(id=complaint_id, user=request.user)
            if complaint.pdf_file:
                return FileResponse(default_storage.open(complaint.pdf_file.name), as_attachment=True, filename=f'complaint_{complaint.id}.pdf')
            return Response({'error': 'PDF не найден'}, status=404)
        except Complaint.DoesNotExist:
            return Response({'error': 'Жалоба не найдена'}, status=404)

class SubmitLegalComplaintView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['user'] = request.user.id  # Используем user_id вместо объекта User

        # Логирование полученных данных для отладки
        logger.debug("Received data: %s", dict(data))

        # Фильтруем данные, маппим userPhone на company_phone
        filtered_data = {
            'company_name': data.get('company_name', ''),
            'company_phone': data.get('userPhone', ''),
            'attachment': data.get('fine_photo'),
            'user': data.get('user')  # Передаем user_id
        }

        # Логирование отфильтрованных данных
        logger.debug("Filtered data: %s", filtered_data)

        # Проверка на обязательные поля
        if not filtered_data['company_name']:
            return Response({'error': 'Поле company_name обязательно'}, status=status.HTTP_400_BAD_REQUEST)
        if not filtered_data['company_phone']:
            return Response({'error': 'Поле company_phone обязательно'}, status=status.HTTP_400_BAD_REQUEST)
        if not filtered_data['attachment']:
            return Response({'error': 'Поле attachment (fine_photo) обязательно'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = LegalComplaintSerializer(data=filtered_data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Форма юридического лица успешно отправлена'}, status=201)
        return Response(serializer.errors, status=400)
    



class MyComplaintsView(ListAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Complaint.objects.filter(user=self.request.user).order_by('-created_at')
    


class MyLegalComplaintsView(ListAPIView):
    serializer_class = LegalComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LegalComplaint.objects.filter(user=self.request.user).order_by('-created_at')
