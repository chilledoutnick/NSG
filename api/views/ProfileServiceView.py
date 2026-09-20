from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models

from api.views.Services import get_user_from_token
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import Profiles, Service, User
from api.models.Service import ProfileService

class ProfileServiceView(viewsets.GenericViewSet):

        
    @action(methods=["POST"], detail=False)
    def create_services_new(self, request):
        try:
            try:
                user = get_user_from_token(request)
            except Exception as e:
                str(e)
                return Response({"message": "User not Authorised"}, status=status.HTTP_400_BAD_REQUEST)
            username= request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            # user = User.objects.filter(username=username).first()
            if username == user.username:
                name = request.data['name']
                desc = request.data['desc']
                url = request.data.get('url', '')
                max_sorting = Service.objects.filter(fk_user=user).aggregate(models.Max('sorting_id'))[
                                'sorting_id__max'] or 0
                if "service_img" in request.data:
                    service_img = request.data.get('service_img')
                services = Service.objects.create(
                    fk_user_id=user.id,
                    name=name,
                    desc=desc,
                    url=url,
                    sorting_id=max_sorting+1,
                    fk_user=user,
                    
                )
                if "service_img" in request.data:
                    services.service_img = service_img
                    services.save()
                data = {
                    "service_id": services.service_id,
                    "name": name,
                    "desc": desc,
                    "url": url,
                    "sorting_id": services.sorting_id,
                    "service_img": (
                        services.service_img.url
                        if services.service_img and hasattr(services.service_img, "url")
                        else None
                    )
                }
                return Response(data, status=status.HTTP_200_OK)
            else:
                profile=Profiles.objects.filter(username=username).first()
                if profile:
                    name = request.data['name']
                    desc = request.data['desc']
                    url = request.data.get('url', '')
                    max_sorting = ProfileService.objects.filter(fk_profile=profile).aggregate(models.Max('sorting_id'))[
                                    'sorting_id__max'] or 0
                    print(max_sorting)
                    if "service_img" in request.data:
                     service_img = request.data.get('service_img')
                    services = ProfileService.objects.create(
                        fk_profile=profile,
                        name=name,
                        desc=desc,
                        url=url,
                        sorting_id=max_sorting+1,
                        fk_user=user,
                    )
                    if "service_img" in request.data:
                        services.service_img = service_img
                        services.save()
                    data = {
                        "service_id": services.id,
                        "name": name,
                        "desc": desc,
                        "url": url,
                        "sorting_id": services.sorting_id,
                         "service_img": (
                            services.service_img.url
                                if services.service_img and hasattr(services.service_img, "url")
                                else None
                        )
                    }
                    return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_services_new(self, request):
        try:
            username= request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()
            if user:
                services = Service.objects.filter(fk_user=user).order_by('sorting_id')
                services_json = []
                for service in services:
                    services_json += [
                        {
                            "service_id": service.service_id,
                            "name": service.name,
                            "desc": service.desc,
                            "url": service.url,
                            "sorting_id": service.sorting_id,
                            "service_img": service.service_img.url if service.service_img else None
                        }
                    ]
                return Response(data=services_json)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile:
                    services = ProfileService.objects.filter(fk_profile=profile).order_by('sorting_id')
                    services_json = []
                    for service in services:
                        services_json += [
                            {
                                "service_id": service.id,
                                "name": service.name,
                                "desc": service.desc,
                                "url": service.url,
                                "sorting_id": service.sorting_id,
                                "service_img": service.service_img.url if service.service_img else None
                            }
                        ]
                    return Response(data=services_json)
                else:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["POST"], detail=False)
    def update_services_new(self, request):
        try:
            user = get_user_from_token(request)
            if user is None:
                return Response({"message": "User Not found"}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            updated_field = {}
            # first check if this is default profile or not
            if username == user.username:
                service_id = request.data['service_id']
                id_validator = RegexValidator(
                    regex=r'^\d{1,6}$',
                    message='Invalid Id format.'
                )
                try:
                    id_validator(service_id)
                except ValidationError:
                    return Response({'message': 'Invalid Id format'},
                                    status=status.HTTP_400_BAD_REQUEST)
                services = Service.objects.filter(fk_user_id=user.id).filter(service_id=service_id).first()

                if "name" in request.data:
                    services.name = request.data['name']
                    updated_field['name'] = services.name
                if "desc" in request.data:
                    services.desc = request.data['desc']
                    updated_field['desc'] = services.desc
                if "url" in request.data:
                    services.url = request.data['url']
                    updated_field['url'] = services.url
                if "service_img" in request.data:
                    service_img = request.data['service_img']
                    if service_img:
                        services.service_img = service_img
                        updated_field['service_img'] = services.service_img.url if services.service_img else None

                services.save()
                return Response({"updated_field": updated_field} ,status=status.HTTP_200_OK)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile:
                    profile_service_id = request.data.get('service_id')
                    profile_service = ProfileService.objects.filter(id=profile_service_id).first()
                    if profile_service:
                        if "name" in request.data:
                            profile_service.name = request.data['name']
                            updated_field['name'] = profile_service.name
                        if "desc" in request.data:
                            profile_service.desc = request.data['desc']
                            updated_field['desc'] = profile_service.desc
                        if "url" in request.data:
                            profile_service.url = request.data['url']
                            updated_field['url'] = profile_service.url
                        if "service_img" in request.data:
                            service_img = request.data['service_img']
                            if service_img:
                                profile_service.service_img = service_img
                                updated_field['service_img'] = profile_service.service_img.url if profile_service.service_img else None

                        profile_service.save()
                        return Response({"updated_field": updated_field,}, status=status.HTTP_200_OK)
                    else:
                        return Response({"message": "Profile service not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=['POST'], detail=False)
    def delete_service_new(self, request):
        try:
            user = get_user_from_token(request)
            if user is None:
                return Response({"message": "User Not found"}, status=status.HTTP_401_UNAUTHORIZED)
            username = request.data.get('username')
            # first check if this is default profile or not
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            if username == user.username:
                service_id = request.data.get('service_id')
                if not service_id:
                    return Response({'message': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

                service = Service.objects.filter(service_id=service_id, fk_user=user).first()
                if not service:
                    return Response({'message': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)

                service.delete()
                return Response({'message': 'Service deleted successfully'}, status=status.HTTP_200_OK)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile:
                    service_id = request.data.get('service_id')
                    if not service_id:
                        return Response({'message': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

                    profile_service = ProfileService.objects.filter(id=service_id, fk_profile=profile).first()
                    if not profile_service:
                        return Response({'message': 'Profile service not found'}, status=status.HTTP_404_NOT_FOUND)

                    profile_service.delete()
                    return Response({'message': 'Profile service deleted successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(methods=['POST'], detail=False)
    def post_service_sorting_new(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()
            if user:
                sorting = request.data if isinstance(request.data, list) else [request.data]
                res = []
                for sort in sorting:
                    service_id = sort['service_id']
                    sorting_id = sort['sorting_id']
                    try:
                        service = Service.objects.get(fk_user_id=user.id, service_id=service_id)
                        service.sorting_id = sorting_id
                        service.save()
                        res.append(sort)
                    except Service.DoesNotExist:
                        continue  # Skip if the service is not found

                data = {
                    "sorting added": res,
                }
                return Response(data, status=status.HTTP_200_OK)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile:
                    sorting = request.data if isinstance(request.data, list) else [request.data]
                    res = []
                    for sort in sorting:
                        service_id = sort['service_id']
                        sorting_id = sort['sorting_id']
                        try:
                            profile_service = ProfileService.objects.get(fk_profile=profile, id=service_id)
                            profile_service.sorting_id = sorting_id
                            profile_service.save()
                            res.append(sort)
                        except ProfileService.DoesNotExist:
                            continue  # Skip if the profile service is not found

                    data = {
                        "sorting added": res,
                    }
                    return Response(data, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
