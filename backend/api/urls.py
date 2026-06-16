from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, EmployeeViewSet, AttendanceViewSet,
    TimesheetViewSet, LeaveRequestViewSet, ShiftSwapViewSet,
)

router = DefaultRouter()
router.register(r"departments", DepartmentViewSet, basename="department")
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"timesheets", TimesheetViewSet, basename="timesheet")
router.register(r"leaves", LeaveRequestViewSet, basename="leave")
router.register(r"swaps", ShiftSwapViewSet, basename="swap")

urlpatterns = [
    path("", include(router.urls)),
]
