from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models.zapier import Zapier
from api.views.Services import *
import uuid
from django.conf import settings



def generate_unique_key():
    unique_key = uuid.uuid4().hex[:16]
    return unique_key


class ZapierView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def generate_zapier_key(self, request):
        try:
            user = get_user_from_token(request)
            zapier_user = Zapier.objects.filter(fk_user=user).first()
            if zapier_user:
                return Response({'zapier_key': zapier_user.zapier_key}, status=status.HTTP_200_OK)
            
            key = generate_unique_key()

            zapier_user = Zapier.objects.create(fk_user=user, zapier_key=key,timestamp=datetime.datetime.now())
            return Response({'zapier_key': zapier_user.zapier_key}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def authenticate_user(self, request):
        try:
            zapier_key = request.data.get("zapier_key")
            
            if not zapier_key:
                return Response({'message': 'Zapier key is required'}, status=status.HTTP_400_BAD_REQUEST)

            zapier_user = Zapier.objects.select_related('fk_user').filter(zapier_key=zapier_key).first()

            payload = {
                'id': zapier_user.fk_user.id,
                'exp': datetime.datetime.now(datetime.timezone.utc)+ datetime.timedelta(days=30),
                'iat': datetime.datetime.now(datetime.timezone.utc)
            }
            jwt_secret = getattr(settings, "JWT_SECRET", settings.SECRET_KEY)
            token = jwt.encode(payload, jwt_secret, algorithm='HS256')

            response = Response()
            response.set_cookie(key='jwt', value=token, httponly=True)
            
            if zapier_user:
                return Response({
                    'jwt': token,
                    'Name': zapier_user.fk_user.name,
                    'Email': zapier_user.fk_user.email,
                    'username':zapier_user.fk_user.username
                }, status=status.HTTP_200_OK)
            else:
                return Response({'message': 'Not a valid key'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
