from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .forms import CustomUserCreationForm
from .models import CustomUser

@csrf_exempt  # Удалите в продакшене и настройте CSRF
def register(request):
    if request.method == 'POST':
        if request.headers.get('Content-Type') == 'application/json':
            import json
            data = json.loads(request.body)
            print("Полученные данные:", data)  # Для отладки
            form = CustomUserCreationForm(data)
        else:
            form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return JsonResponse({
                'success': True,
                'message': 'Регистрация прошла успешно!',
                'redirect': '/login'
            })
        else:
            errors = {field: error[0] for field, error in form.errors.items()}
            print("Ошибки формы:", errors)  # Для отладки
            return JsonResponse({'success': False, 'errors': errors}, status=400)
    return JsonResponse({'success': False, 'message': 'Метод не поддерживается.'}, status=405)

@csrf_exempt
def login_view(request):
    try:
        print("Полученный метод:", request.method)
        print("Заголовки:", dict(request.headers))
        print("CSRF проверка отключена:", hasattr(request, 'csrf_processing_done'))
        if request.method == 'POST':
            if request.headers.get('Content-Type') == 'application/json':
                import json
                data = json.loads(request.body) if request.body else {}
                print("Полученные данные для логина:", data)
                username = data.get('email')
                password = data.get('password')
            else:
                username = request.POST.get('email')
                password = request.POST.get('password')
            
            user = authenticate(request, username=username, password=password)
            if user is None:
                try:
                    user = CustomUser.objects.get(email=username)
                    if user.check_password(password):
                        login(request, user)
                    else:
                        user = None
                except CustomUser.DoesNotExist:
                    user = None
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'message': 'Вход выполнен успешно!',
                    'redirect': '/home'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'message': 'Неверный email или пароль.'
                }, status=400)
        return JsonResponse({'success': False, 'message': 'Метод не поддерживается.'}, status=405)
    except Exception as e:
        print(f"Ошибка: {str(e)}")
        return JsonResponse({'success': False, 'message': f'Внутренняя ошибка сервера: {str(e)}'}, status=500)
    
@csrf_exempt
def user_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({
            'success': True,
            'message': 'Вы вышли из системы.',
            'redirect': '/login'
        })
    return JsonResponse({'success': False, 'message': 'Метод не поддерживается.'}, status=405)