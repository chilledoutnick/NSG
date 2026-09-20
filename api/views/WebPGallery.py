from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from datetime import datetime
from api.models.WebPGallery import WebPGallery
from api.views.Services import webp_convertor


class webPGallery(viewsets.GenericViewSet):



    @action(methods=["POST"], detail=False)   
    def save_img(self, request):
        try:
            picture = request.FILES['picture']
            webp_file = webp_convertor(picture)

            WebPGallery.objects.create(webp_image=webp_file
                                    ,timestamp=datetime.now())

            return JsonResponse({'success': True, 'message': 'Image processed and saved successfully.'})
        except KeyError:
            return JsonResponse({'success': False, 'message': 'Invalid request. Missing "picture" in the request.'})
        

    @action(methods=["POST"], detail=False)
    def get_last_images(self, request):
        try:

            number = request.data.get('number')
            number = int(number)

            
            last_images = WebPGallery.objects.order_by('-id')[:number]

        
            image_data = []
            for image in last_images:
                image_data.append({
                    'id': image.id,
                    'webp_image_url': image.webp_image.url
                })

            return JsonResponse({'success': True, 'image_data': image_data})
        except ValueError:
            return JsonResponse({'success': False, 'message': 'Invalid number provided.'})
        
    @action(methods=["POST"], detail=False)
    def delete_img(self, request):
        try:
            image_id= request.data.get('id')
            webp_image = get_object_or_404(WebPGallery, pk=image_id)
            webp_image.delete()
            return JsonResponse({'success': True, 'message': 'Image deleted successfully.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error deleting image: {str(e)}'})

