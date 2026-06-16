from rest_framework.routers import DefaultRouter
from .views import TimesheetViewSet

router = DefaultRouter()
router.register(r'timesheets', TimesheetViewSet)

urlpatterns = router.urls