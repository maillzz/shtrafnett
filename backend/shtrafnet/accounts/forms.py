from django import forms
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class CustomUserCreationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput, min_length=8, help_text='Введите пароль (минимум 8 символов).')
    phone = forms.CharField(max_length=15, required=False, help_text='Optional phone number')

    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'phone', 'password')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])  # Хешируем пароль
        if commit:
            user.save()
        return user