from django.shortcuts import render
from rest_framework import generics, permissions # أضفنا permissions
from .serializers import RegisterSerializer, UserSerializer # تأكد من إضافة UserSerializer في ملف السيريالايزر
from .models import User

# كود التسجيل بتاعك
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

# --- التعديل الجديد لتعديل البيانات ---
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    # لازم يكون مسجل دخول عشان يشوف أو يعدل
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # دي بتضمن إن الـ API يرجع بيانات المستخدم اللي باعت الـ Request فقط
        return self.request.user