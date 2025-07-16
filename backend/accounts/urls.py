from django.urls import path
from . import views
from .views import SubmitLegalComplaintView
from .views import MyComplaintsView, MyLegalComplaintsView


urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('submit-complaint/', views.SubmitComplaintView.as_view(), name='submit-complaint'),
    path('submit-legal-complaint/', SubmitLegalComplaintView.as_view(), name='submit-legal-complaint'),
    path('complaints/', MyComplaintsView.as_view(), name='my-complaints'),
    path('legal-complaints/', MyLegalComplaintsView.as_view(), name='my-legal-complaints'),
    path('download-pdf/<int:complaint_id>/', views.DownloadPDFView.as_view(), name='download-pdf'),
]
