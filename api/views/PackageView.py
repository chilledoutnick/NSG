from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from django.core.paginator import Paginator, EmptyPage
from api.views.Services import *
from api.models import *


class PackageView(viewsets.GenericViewSet):
    """   serializer_class = PackageSerializer
        queryset = Package.objects.all() """

    from django.db.models import Q
    from django.core.paginator import Paginator, EmptyPage
    from rest_framework.decorators import action
    from rest_framework.response import Response
    from rest_framework import status

    @action(methods=['POST'], detail=False)
    def user_package(self, request):
        try:
            user = get_user_from_token(request)
            if user is None or not user.is_superuser:
                return Response({'message': "Don't have access!"}, status=status.HTTP_403_FORBIDDEN)

            # Inputs
            page = int(request.data.get('page', 1))
            page_size = int(request.data.get('page_size', 10))
            search_query = request.data.get('search', '').strip()

            data = []

            for package_id in range(3, 7):
                # Base queryset
                users_qs = User.objects.filter(fk_package_id=package_id)

                # Apply search filter if provided
                if search_query:
                    users_qs = users_qs.filter(
                        Q(name__icontains=search_query) |
                        Q(email__icontains=search_query)
                    )

                users_qs = users_qs.order_by('-id')

                # Paginate
                paginator = Paginator(users_qs, page_size)
                try:
                    current_page = paginator.page(page)
                except EmptyPage:
                    current_page = []

                # Serialize users
                users_data = [
                    {
                        "user_id": u.id,
                        "name": u.name,
                        "package": package_id,
                        "email": u.email,
                        "username": u.username,
                        "custom_username": u.custom_username,
                        "is_active": u.is_active,
                        "payment_status": u.payment_status,
                    }
                    for u in current_page
                ]

                data.append({
                    f"package_{package_id}": users_data,
                    "pagination": {
                        "current_page": page if current_page else 0,
                        "total_pages": paginator.num_pages if paginator.count else 0,
                        "total_users": paginator.count
                    }
                })

            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def admin_package(self, request):
        try:
            user = get_user_from_token(request)
            if user is None or not user.is_superuser:
                return Response({'message': "Don't have access!"}, status=status.HTTP_403_FORBIDDEN)

            # Retrieve page and page size from request.data
            page = int(request.data.get('page', 1))  # Default to page 1
            page_size = int(request.data.get('page_size', 10))  # Default to 10 items per page

            admin_users = AdminAdvisor.objects.all()
            data = []

            for user in admin_users:
                admin_user = User.objects.filter(id=user.fk_user_id).first()
                team_member = TeamReferralRelationship.objects.filter(admin_user_id=admin_user.id).order_by('-id')

                team = {
                    "user_id": admin_user.id,
                    "name": admin_user.name,
                    "email": admin_user.email,
                    "username": admin_user.username,
                    "custom_username": admin_user.custom_username,
                    "payment_status": admin_user.payment_status,
                    "team_members": [
                        {
                            "user_id": member.team_user_id,
                            "name": member.team_user.name,
                            "email": member.team_user.email,
                            "username": member.team_user.username,
                            "custom_username": member.team_user.custom_username,
                            "active": member.team_user.is_active
                        }
                        for member in team_member
                    ]
                }
                data.append(team)

            # Apply pagination to the data
            paginator = Paginator(data, page_size)
            paginated_data = paginator.get_page(page)

            # Prepare the response with pagination details
            response = {
                "current_page": paginated_data.number,
                "total_pages": paginator.num_pages,
                "total_items": paginator.count,
                "page_size": page_size,
                "data": paginated_data.object_list,
            }

            return Response(response, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)