from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'profile_type', 'selected_country', 'preferences']
        read_only_fields = ['id']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    profile_type = serializers.ChoiceField(choices=UserProfile.PROFILE_TYPES)
    selected_country = serializers.CharField(max_length=100)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'profile_type', 'selected_country']
    
    def create(self, validated_data):
        profile_type = validated_data.pop('profile_type')
        selected_country = validated_data.pop('selected_country')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        UserProfile.objects.create(
            user=user,
            profile_type=profile_type,
            selected_country=selected_country
        )
        
        return user