from rest_framework import serializers
from .models import Department, Employee, Attendance, Timesheet, LeaveRequest, ShiftSwap


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = "__all__"


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = "__all__"


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)

    class Meta:
        model = Attendance
        fields = "__all__"

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class TimesheetSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Timesheet
        fields = "__all__"

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source="employee.employee_code", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = "__all__"

    def get_employee_name(self, obj):
        return f"{obj.employee.first_name} {obj.employee.last_name}"


class ShiftSwapSerializer(serializers.ModelSerializer):
    requester_name = serializers.SerializerMethodField()
    target_name = serializers.SerializerMethodField()

    class Meta:
        model = ShiftSwap
        fields = "__all__"

    def get_requester_name(self, obj):
        return f"{obj.requester.first_name} {obj.requester.last_name}"

    def get_target_name(self, obj):
        return f"{obj.target.first_name} {obj.target.last_name}"
