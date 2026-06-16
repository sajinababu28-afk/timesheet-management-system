from django.contrib import admin
from .models import Department, Employee, Attendance, Timesheet, LeaveRequest, ShiftSwap

admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(Timesheet)
admin.site.register(LeaveRequest)
admin.site.register(ShiftSwap)
