from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models

from api.views.Services import get_user_from_token, image_compressor
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from api.models import Profiles, Service, User
from api.models.Service import ProfileService

class ServiceView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def get_services(self, request):
        try:
            try:
                user = get_user_from_token(request)
            except Exception as e:
                str(e)
                user_id = request.data['user_id']
                id_validator = RegexValidator(
                    regex=r'^\d{1,6}$',
                    message='Invalid Id format.'
                )
                try:
                    id_validator(user_id)
                except ValidationError:
                    return Response({'message': 'Invalid Id format'},
                                    status=status.HTTP_400_BAD_REQUEST)
                user = User.objects.get(id=user_id)

            services = Service.objects.filter(fk_user=user).order_by('sorting_id')
            services_json = []
            for service in services:
                services_json += [
                    {
                        "service_id": service.service_id,
                        "name": service.name,
                        "desc": service.desc,
                        "url": service.url,
                        "sorting_id": service.sorting_id
                    }
                ]
            return Response(data=services_json)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def create_services(self, request):
        try:
            try:
                user = get_user_from_token(request)
            except Exception as e:
                str(e)
                return Response({"message": "User not Authorised"}, status=status.HTTP_400_BAD_REQUEST)
            name = request.data['name']
            desc = request.data['desc']
            url = request.data.get('url', '')
            max_sorting = Service.objects.filter(fk_user=user).aggregate(models.Max('sorting_id'))[
                              'sorting_id__max'] or 0
            services = Service.objects.create(
                fk_user_id=user.id,
                name=name,
                desc=desc,
                url=url,
                sorting_id=max_sorting+1
            )
            data = {
                "service_id": services.service_id,
                "name": name,
                "desc": desc,
                "url": url,
                "sorting_id": services.sorting_id
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["POST"], detail=False)
    def update_services(self, request):
        try:
            user = get_user_from_token(request)
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
            updated_field = {}
            services = Service.objects.filter(fk_user_id=user.id).filter(service_id=service_id).first()

            if "name" in request.data:
                services.name = request.data['name']
                updated_field['service_name'] = services.name
            if "desc" in request.data:
                services.desc = request.data['desc']
                updated_field['service_desc'] = services.desc
            if "url" in request.data:
                services.url = request.data['url']
                updated_field['service_url'] = services.url

            services.save()
            return Response(updated_field, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def delete_service(self, request):
        try:

            service_id = request.data.get('service_id')
            if not service_id:
                return Response({'message': 'Service ID is required'}, status=status.HTTP_400_BAD_REQUEST)

            service = Service.objects.filter(service_id=service_id).first()
            if not service:
                return Response({'message': 'service not found'}, status=status.HTTP_404_NOT_FOUND)

            service.delete()
            return Response({'message': 'Lead deleted successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=["POST"], detail=False)
    def post_service_sorting(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

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

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["POST"], detail=False)
    def create_services_new(self, request):
        try:
            username= request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()
            data = {}
            if user:
                name = request.data['name']
                desc = request.data['desc']
                url = request.data.get('url', '')
                max_sorting = Service.objects.filter(fk_user=user).aggregate(models.Max('sorting_id'))[
                                'sorting_id__max'] or 0
                service_img = request.FILES.get('img', None)
                service_img =  image_compressor(service_img,user) if service_img else None
                services = Service.objects.create(
                    fk_user_id=user.id,
                    name=name,
                    desc=desc,
                    url=url,
                    sorting_id=max_sorting+1,
                    fk_user=user,
                    service_img=service_img
                )
                data = {
                    "service_id": services.service_id,
                    "name": name,
                    "desc": desc,
                    "url": url,
                    "sorting_id": services.sorting_id
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
                    service_img = request.files.get('img', None)
                    service_img =  image_compressor(service_img,profile) if service_img else None
                    services = ProfileService.objects.create(
                        fk_profile=profile,
                        name=name,
                        desc=desc,
                        url=url,
                        sorting_id=max_sorting+1,
                        fk_user=user,
                        service_img=service_img
                    )
                    data = {
                        "service_id": services.id,
                        "name": name,
                        "desc": desc,
                        "url": url,
                        "sorting_id": services.sorting_id
                    }
                    return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def get_services_new(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)

            services_json = []

            # Get user services
            try:
                user = User.objects.get(username=username)
                services = Service.objects.filter(fk_user=user).order_by('sorting_id')
                for service in services:
                    services_json.append({
                        "service_id": service.service_id,
                        "name": service.name,
                        "desc": service.desc,
                        "url": service.url,
                        "sorting_id": service.sorting_id,
                        "service_img": service.service_img.url if service.service_img else None
                    })
            except User.DoesNotExist:
                user = None

            # Get profile services
            try:
                profile = Profiles.objects.get(username=username)
                profile_services = ProfileService.objects.filter(fk_profile=profile).order_by('sorting_id')
                for service in profile_services:
                    services_json.append({
                        "id": service.id,
                        "name": service.name,
                        "desc": service.desc,
                        "url": service.url,
                        "sorting_id": service.sorting_id,
                        "service_img": service.service_img.url if service.service_img else None
                    })
            except Profiles.DoesNotExist:
                profile = None
                
            return Response(data=services_json)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


    @action(methods=["POST"], detail=False)
    def update_services_new(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()
            if user:
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
                updated_field = {}
                services = Service.objects.filter(fk_user_id=user.id).filter(service_id=service_id).first()

                if "name" in request.data:
                    services.name = request.data['name']
                    updated_field['service_name'] = services.name
                if "desc" in request.data:
                    services.desc = request.data['desc']
                    updated_field['service_desc'] = services.desc
                if "url" in request.data:
                    services.url = request.data['url']
                    updated_field['service_url'] = services.url
                if "img" in request.FILES:
                    service_img = request.FILES.get('img', None)
                    if service_img:
                        service_img = image_compressor(service_img, user)
                        services.service_img = service_img
                        updated_field['service_img'] = services.service_img.url if services.service_img else None

                services.save()
                return Response(updated_field, status=status.HTTP_200_OK)
            else:
                profile = Profiles.objects.filter(username=username).first()
                if profile:
                    profile_service_id = request.data.get('service_id')
                    profile_service = ProfileService.objects.filter(id=profile_service_id).first()
                    if profile_service:
                        if "name" in request.data:
                            profile_service.name = request.data['name']
                            updated_field['service_name'] = profile_service.name
                        if "desc" in request.data:
                            profile_service.desc = request.data['desc']
                            updated_field['service_desc'] = profile_service.desc
                        if "url" in request.data:
                            profile_service.url = request.data['url']
                            updated_field['service_url'] = profile_service.url
                        if "img" in request.FILES:
                            service_img = request.FILES.get('img', None)
                            if service_img:
                                service_img = image_compressor(service_img, profile)
                                profile_service.service_img = service_img
                                updated_field['service_img'] = profile_service.service_img.url if profile_service.service_img else None

                        profile_service.save()
                        return Response(updated_field, status=status.HTTP_200_OK)
                    else:
                        return Response({"message": "Profile service not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=['POST'], detail=False)
    def delete_service_new(self, request):
        try:
            username = request.data.get('username')
            if not username:
                return Response({"message": "Username is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.filter(username=username).first()
            if user:
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
                sorting = request.data.get('sorting_list', [])

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
                    sorting = request.data.get('sorting_list', [])

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
