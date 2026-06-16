from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import Department, Employee, Attendance, Timesheet, LeaveRequest, ShiftSwap
from .serializers import (
    DepartmentSerializer, EmployeeSerializer, AttendanceSerializer,
    TimesheetSerializer, LeaveRequestSerializer, ShiftSwapSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by("name")
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().order_by("-id")
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by("-date", "-check_in")
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"], url_path="checkin")
    def check_in(self, request):
        employee_code = request.data.get("employee_code", "").strip()
        try:
            employee = Employee.objects.get(employee_code=employee_code)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        record, created = Attendance.objects.get_or_create(
            employee=employee, date=today,
            defaults={"check_in": timezone.now()}
        )
        if not created and record.check_in:
            return Response({"error": "Already checked in today."}, status=status.HTTP_400_BAD_REQUEST)
        if not created:
            record.check_in = timezone.now()
            record.save()

        return Response(AttendanceSerializer(record).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="checkout")
    def check_out(self, request):
        employee_code = request.data.get("employee_code", "").strip()
        try:
            employee = Employee.objects.get(employee_code=employee_code)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        try:
            record = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({"error": "No check-in found for today."}, status=status.HTTP_400_BAD_REQUEST)

        if record.check_out:
            return Response({"error": "Already checked out today."}, status=status.HTTP_400_BAD_REQUEST)

        record.check_out = timezone.now()
        record.save()
        return Response(AttendanceSerializer(record).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="status/(?P<employee_code>[^/.]+)")
    def today_status(self, request, employee_code=None):
        try:
            employee = Employee.objects.get(employee_code=employee_code)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        try:
            record = Attendance.objects.get(employee=employee, date=today)
            return Response(AttendanceSerializer(record).data)
        except Attendance.DoesNotExist:
            return Response({"status": "not_checked_in"})


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all().order_by("-date")
    serializer_class = TimesheetSerializer
    permission_classes = [AllowAny]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().order_by("-applied_on")
    serializer_class = LeaveRequestSerializer
    permission_classes = [AllowAny]


class ShiftSwapViewSet(viewsets.ModelViewSet):
    queryset = ShiftSwap.objects.all().order_by("-created_at")
    serializer_class = ShiftSwapSerializer
    permission_classes = [AllowAny]
