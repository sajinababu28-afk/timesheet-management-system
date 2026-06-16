from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Timesheet
from .serializers import TimesheetSerializer


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all().order_by('-id')
    serializer_class = TimesheetSerializer

    # 🔥 THIS FIXES YOUR 401 ERROR
    permission_classes = [AllowAny]