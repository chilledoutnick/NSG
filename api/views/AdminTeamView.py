from api.models.TeamAdmin import AdminAdvisor, TeamAdvisorGallery, TeamLink, TeamReferralRelationship, TeamService, TeamVideoLink
from api.serializers import Team_SocialHandleSerializer
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.paginator import Paginator
from rest_framework import viewsets, status
from api.views.Services import *
from api.models import Contact, ContactTag
import string
import random
from django.conf import settings



def generate_referral_code():
    code_length = 8
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(code_length))


class AdminTeamView(viewsets.GenericViewSet):

    @action(methods=['POST'], detail=False)
    def generate_admin(self, request):
        try:
            id_validator = RegexValidator(
                regex=r'^\d{1,6}$',
                message='Invalid Id format.'
            )
            try:
                user = get_user_from_token(request)
            except Exception as e:
                str(e)
                user_id = request.data.get("user_id")
                try:
                    id_validator(user_id)
                except ValidationError:
                    return Response({'message': 'Invalid Id format'},
                                    status=status.HTTP_400_BAD_REQUEST)

                user = User.objects.filter(id=user_id).first()

            if user is None:
                return Response({'message': 'No User found'}, status=status.HTTP_404_NOT_FOUND)

            admin = AdminAdvisor.objects.filter(fk_user=user).first()
            if admin:
                team_member_count= TeamReferralRelationship.objects.filter(
                    admin_user=admin.fk_user,
                    team_user__is_active=True
                ).count()

                return Response({'referral_code': admin.code,
                                 'logo': admin.logo.url if admin.logo else None,
                                 'color': admin.color,
                                 'team_limit':admin.team_limit,
                                 'team_member_count': team_member_count
                                 }, status=status.HTTP_200_OK)
            
            code = generate_referral_code()
            color = user.background_colour
            logo = user.logo
            team_limit=request.data.get("team_limit")

            admin = AdminAdvisor.objects.create(fk_user=user,
                                                code=code,
                                                color=color,
                                                logo=logo ,
                                                team_limit=team_limit)
            return Response({'referral_code': admin.code,
                             'logo': admin.logo.url if admin.logo else None,
                             'color': admin.color,
                             'team_limit':team_limit
                             }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def update_admin(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'},
                                status=status.HTTP_404_NOT_FOUND)

            admin = AdminAdvisor.objects.filter(fk_user=user).first()
            if not admin:
                return Response({'message': 'Admin User not found'},
                                status=status.HTTP_404_NOT_FOUND)

            if "logo" in request.data:
                logo = request.data["logo"]
                logo = image_compressor(logo, user)
                admin.logo = logo

            if "color" in request.data:
                color = request.data["color"]
                admin.color = color

            admin.save()

            return Response({
                'message': 'Logo and/or color updated successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)},
                            status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=['POST'], detail=False)
    def delete_admin_logo(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}
                                , status=status.HTTP_404_NOT_FOUND)

            admin = AdminAdvisor.objects.filter(fk_user=user).first()
            if not admin:
                return Response({'message': 'Admin User not found'},
                                status=status.HTTP_404_NOT_FOUND)

            # Delete the logo
            admin.logo.delete(save=True)

            return Response({'message': 'Logo deleted successfully'},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)


        

    @action(methods=['POST'], detail=False)
    def admin_by_referralcode(self, request):
        try:
            code = request.data.get('code')
            admin = AdminAdvisor.objects.get(code=code)
            user_id = admin.fk_user_id
            team_member_count= TeamReferralRelationship.objects.filter(
                admin_user=admin.fk_user,
                team_user__is_active=True ).count()
            logo_url = admin.logo.url if admin.logo else None
            return Response({'id':admin.id,
                             'user_id': user_id,
                             'referral_code': admin.code,
                             'logo':logo_url,
                             'color':admin.color,
                             'team_limit':admin.team_limit,
                             'team_member_count': team_member_count
                             }, status=status.HTTP_200_OK)
        except AdminAdvisor.DoesNotExist:
            return Response({'message': 'Referral code not found'},
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=['POST'], detail=False)
    def create_team_member(self,request):
        try:
            host_user_id = request.data.get('host_user')
            referred_user_id = request.data.get('referred_user')
            
            host_user = get_object_or_404(User, id=host_user_id)
            referred_user = get_object_or_404(User, id=referred_user_id)
            referral_relationship = TeamReferralRelationship.objects.create(admin_user=host_user,
                                                                            team_user=referred_user)
            
            data = {
                'host_user': referral_relationship.admin_user.id,
                'referred_user': referral_relationship.team_user.id
            }
            
            return Response({'data': data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'message': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

    @action(methods=['POST'], detail=False)
    def get_team_member(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({"status": "error", "message": "No user found for the current user"},
                                status=status.HTTP_404_NOT_FOUND)

            team_relationships = TeamReferralRelationship.objects.filter(admin_user=user)

            if not team_relationships.exists():
                return Response({"status": "error", "message": "No team members found for the user"},
                                status=status.HTTP_404_NOT_FOUND)

            team_members_data = []
            for relationship in team_relationships:
                team_user = relationship.team_user
                profile_picture_url = team_user.profile_picture.url if team_user.profile_picture else "https://storage.googleapis.com/nsg-crm-storage-public/media/webp_images/Group_1000003424_2_png.webp"
                # Generate JWT token for the team member
                payload = {
                    'id': team_user.id,
                    'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30),
                    'iat': datetime.datetime.now(datetime.timezone.utc)
                }
                jwt_secret = getattr(settings, "JWT_SECRET", settings.SECRET_KEY)
                token = jwt.encode(payload, jwt_secret, algorithm='HS256')
                team_member_data = {
                    "id": team_user.id,
                    "name": team_user.name,
                    "username": team_user.username,
                    "email": team_user.email,
                    "company": team_user.company,
                    "profile_picture": profile_picture_url,
                    "active":team_user.is_active,
                    "token": token
                }
                team_members_data.append(team_member_data)
            team_members_data.sort(key=lambda member: not member["active"])

            return Response({"status": "success", "data": team_members_data},
                            status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"status": "error", "message": str(e)},
                            status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def invite_team_member(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            admin = AdminAdvisor.objects.filter(fk_user=user).first()
            if not admin:
                return Response({'message': 'Admin user not found'}, status=status.HTTP_404_NOT_FOUND)
            
            name = request.data['name']
            email = request.data['email'].strip()

            send_team_referral_email(name, email, admin)

            return Response({'message': 'Email sent'}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print error message for debugging purposes
            print(f"Error: {str(e)}")
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    @action(methods=['POST'], detail=False)
    def get_team_contact_log(self, request):
        try:
            user = get_user_from_token(request)
            user_ids = [user.id]
            team_relationship = TeamReferralRelationship.objects.filter(admin_user=user).first()
            if team_relationship:
                admin_user = team_relationship.admin_user
                team_users = TeamReferralRelationship.objects.filter(admin_user=admin_user).values_list('team_user_id', flat=True)
                user_ids = list(team_users) + [admin_user.id]

            unique_contacts = Contact.objects.filter(owner_id__in=user_ids).order_by('-date_added')
            page_size = int(request.data.get('page_size', len(unique_contacts)))
            page_number = int(request.data.get('page_number', 1))

            paginator = Paginator(unique_contacts, per_page=page_size)
            page_obj = paginator.get_page(page_number)

            data = {}
            contact_data = []
            names = set()
            contact_start_number = (page_obj.number - 1) * page_size + 1
            contact_end_number = contact_start_number + len(page_obj) - 1
            for contact in page_obj:
                appointment = AdvisorAppointment.objects.select_related('fk_appointment').filter(
                    fk_user_id__in=user_ids,
                    fk_appointment__fk_contact=contact.id,
                    status__in=['active', 1]
                ).order_by(
                    '-fk_appointment__appointment_date', '-fk_appointment__appointment_time'
                ).first()
                contact_tag = ContactTag.objects.filter(fk_contact=contact).values('fk_tag__name')
                contact_data.append({
                    'contact_id': contact.id,
                    'email': contact.email,
                    'name': contact.name,
                    'phone': contact.phone,
                    'category': [tag['fk_tag__name'] for tag in contact_tag],
                    'address': contact.address,
                    'date created': contact.date_added,
                    'upcoming_appointment': {
                        "appointment_date": appointment.fk_appointment.appointment_date if appointment else None,
                        "appointment_time": appointment.fk_appointment.appointment_time if appointment else None,
                        "appointment_id": appointment.fk_appointment.appointment_id if appointment else None
                    },
                    'user_name': contact.owner.name
                })
                names.add(contact.owner.name)

            data["total_data"] = unique_contacts.count()
            data["total_pages"] = paginator.num_pages
            data["contacts_data"] = contact_data
            data["contact_start_number"] = contact_start_number
            data["contact_end_number"] = contact_end_number
            ## add name of team member in list
            data['team_member'] = list(names)

            return Response(data=data, status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

    @action(methods=['POST'], detail=False)
    def deactivate_team_member(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_team_admin:
                return Response({"message": "You are not an admin."}, status=status.HTTP_403_FORBIDDEN)
            
            user_id = request.data.get("user_id")
            if user_id:
                team_user = User.objects.filter(id=user_id).first()
                if team_user:
                    team_user.is_active = False
                    team_user.save()
                    return Response({"message": "Team member deactivated successfully."}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Team user not found."}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"message": "User ID not provided."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['POST'], detail=False)
    def create_social_media_team(self, request): 
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_team_admin:
                return Response({"message": "You are not an admin."}, status=status.HTTP_403_FORBIDDEN)
            data = request.data
            for data in data:
                data["fk_user"] = user.id
            serializer = Team_SocialHandleSerializer(data=data, many=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["POST"], detail=False)
    def create_team_service(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_team_admin:
                return Response({"message": "You are not an admin."}, status=status.HTTP_403_FORBIDDEN)
            name = request.data['name']
            desc = request.data['desc']
            services = TeamService.objects.create(
                fk_user_id=user.id,
                name=name,
                desc=desc
            )

            data = {
                "service_id": services.service_id,
                "name": name,
                "desc": desc,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(methods=["POST"], detail=False)
    def create_team_link(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_team_admin:
                return Response({"message": "You are not an admin."}, status=status.HTTP_403_FORBIDDEN)
            link = request.data.get("link")
            title= request.data.get("title")
            description = request.data.get("description")


            
            link = TeamLink.objects.create(
                fk_user=user,
                link=link,
                title=title,
                description=description
            )
            
            return Response(data={"message": "Link added successfully", "link_id": link.id})
        except User.DoesNotExist:
            return Response({"message": "User not found for the given user"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)    
    
    @action(methods=["POST"], detail=False)
    def add_team_video_link(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_team_admin:
                return Response({"message": "You are not an admin."}, status=status.HTTP_403_FORBIDDEN)
            
            title = request.data.get("title")
            video_link = request.data.get("video_link")
            
            # Check if there's an existing video for this user
            existing_video = TeamVideoLink.objects.filter(fk_user=user).first()
            if existing_video:
                # If an existing video is found, update its title and video_link
                existing_video.title = title
                existing_video.video_link = video_link
                existing_video.save()
                return Response(data={"message": "Link updated successfully", "video_link_id": existing_video.id})
            else:
                # If no existing video is found, create a new one
                video_link = TeamVideoLink.objects.create(
                    fk_user=user,
                    title=title, 
                    video_link=video_link,
                )
                return Response(data={"message": "Link added successfully", "video_link_id": video_link.id})
        except User.DoesNotExist:
            return Response({"message": "User not found for the given user"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(methods=["POST"], detail=False)
    def create_update_team_gallery(self, request):
        try:
            user = get_user_from_token(request)
            if not user:
                return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
            if not user.is_team_admin:
                return Response({"message": "You are not an admin."}, status=status.HTTP_403_FORBIDDEN)
            picture_file = request.data["picture"]
            picture = image_compressor(picture_file, user)
            column_number = request.data["column_number"]
            gallery = TeamAdvisorGallery.objects.filter(fk_user_id=user.id).filter(
                column_number=column_number).first()
            if gallery is None:
                gallery = TeamAdvisorGallery.objects.create(
                    pictures=picture,
                    column_number=column_number,
                    fk_user_id=user.id
                )
            else:
                gallery.column_number = column_number
                gallery.pictures = picture
                gallery.save()
            data = {"picture": gallery.pictures.url, "gallery_id": gallery.gallery_id}
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


        
    


    

        
