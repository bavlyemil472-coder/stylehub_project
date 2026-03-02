from django.urls import path
from .views import RegisterView, ProfileView # أضفنا ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    
    # المسار الجديد لعرض وتعديل بيانات المستخدم
    path('profile/', ProfileView.as_view(), name='profile'),
]