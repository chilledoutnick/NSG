from api.serializers import TeamMemberSerializer
from rest_framework import viewsets
from api.models import *


class TeamMemberView(viewsets.GenericViewSet):
    serializer_class = TeamMemberSerializer
    queryset = TeamMember.objects.all()
