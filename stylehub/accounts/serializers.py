from rest_framework import serializers
from .models import User

# كود التسجيل (كما هو)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

# --- التعديل الجديد: سيريالايزر لعرض وتعديل البيانات الشخصية ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # 'first_name' و 'last_name' متاحين تلقائياً من الـ AbstractUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        # الـ username والـ role نخليهم للقراءة فقط عشان العميل ميغيرهمش
        read_only_fields = ('username', 'role')