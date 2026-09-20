from api.serializers import LeadGenerationSerializer
from django.core.exceptions import ValidationError
from api.views.Services import get_user_from_token
from django.core.validators import RegexValidator
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.paginator import Paginator
from rest_framework import viewsets, status
from api.models.LeadGeneration import *
from datetime import datetime



class LeadGenerationView(viewsets.GenericViewSet):


    @action(methods=['POST'], detail=False)
    def get_lead(self,request):
        try: 
            user=get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message':'Dont have access'},
                                status=status.HTTP_401_UNAUTHORIZED)
            
            leads = LeadGeneration.objects.all().order_by('-id')
            serializer = LeadGenerationSerializer(leads, many=True)  
            return Response(serializer.data, status=status.HTTP_200_OK)  

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    @action(methods=['POST'], detail=False)
    def create_lead(self, request):
        try:
           
            serializer = LeadGenerationSerializer(data=request.data)  
            if serializer.is_valid():  
                serializer.save()  
                return Response(serializer.data, status=status.HTTP_201_CREATED)  
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            


    @action(methods=['POST'], detail=False)
    def get__not_lead(self, request):
        try:
            user = get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message': 'Dont have access'},
                                status=status.HTTP_400_BAD_REQUEST)
            page_size = request.data['page_size']
            page_number = request.data['page_number']
            from_date_str = request.data['from_date']
            to_date_str = request.data['to_date']
            pages = [page_number, page_size]
            dates = [from_date_str, to_date_str]
            id_validator = RegexValidator(
                regex=r'^\d{1,10}$',
                message='Invalid format.'
            )
            date_validator = RegexValidator(
                regex=r'^\d{4}\-\d{2}\-\d{2}$',
                message='Invalid Date format. It should be YYYY-MM-DD'
            )
            for date in dates:
                try:
                    date_validator(date)
                except ValidationError:
                    return Response({'message': 'Invalid Date format. It should be YYYY-MM-DD'},
                                    status=status.HTTP_400_BAD_REQUEST)
            for page in pages:
                try:
                    id_validator(page)
                except ValidationError:
                    return Response({'message': 'Invalid format, only numbers accepted'},
                                    status=status.HTTP_400_BAD_REQUEST)
            from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date()
            to_date = datetime.strptime(to_date_str, "%Y-%m-%d").date()

            lead_generation = LeadGeneration.objects.filter(timestamp__range=[from_date, to_date]).order_by('-id')
            paginator = Paginator(lead_generation, per_page=page_size)  # Change per_page value as per your requirement
            page_no = request.query_params.get('page', page_number)
            page_obj = paginator.get_page(page_no)
            # Extract the required data from the paginated page_obj
            data = [{
                "email": lead.email,
                "timestamp": lead.timestamp
            } for lead in page_obj]
            # Build the response with pagination information
            response = {
                "count": paginator.count,
                "current_page": page_obj.number,
                "total_pages": paginator.num_pages,
                "from_date": from_date,
                "to_date": to_date,
                "results": data
            }
            return Response(data=response, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        


    @action(methods=['POST'], detail=False)
    def delete_lead(self, request):
        try:
            user=get_user_from_token(request)
            if not user.is_superuser:
                return Response({'message':'Dont have access'},
                                status=status.HTTP_401_UNAUTHORIZED)

            generation_id = request.data.get('generation_id')
            if not generation_id:
                return Response({'message': 'Generation ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Assuming you have a Lead model, and you want to delete based on generation_id
            lead = LeadGeneration.objects.filter(generation_id=generation_id).first()
            if not lead:
                return Response({'message': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
            
            lead.delete()
            return Response({'message': 'Lead deleted successfully'}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            
