from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer pour l'inscription d'un nouvel utilisateur"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password_confirm')
        
    def validate(self, attrs):
        """Validation des données d'inscription"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        # Vérifier que l'email n'est pas déjà utilisé
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
            
        return attrs
    
    def create(self, validated_data):
        """Création d'un nouvel utilisateur"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer pour la connexion utilisateur"""
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        """Validation des identifiants de connexion"""
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError("Ce compte utilisateur est désactivé.")
            else:
                raise serializers.ValidationError("Identifiants incorrects.")
        else:
            raise serializers.ValidationError("Le nom d'utilisateur et le mot de passe sont requis.")


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les informations utilisateur"""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class TokenSerializer(serializers.Serializer):
    """Serializer pour les tokens JWT"""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()