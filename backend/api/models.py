from django.db import models
from django.utils import timezone


class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Employee(models.Model):
    employee_code = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    joining_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.employee_code} - {self.first_name} {self.last_name}"


class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.localdate)
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    total_hours = models.FloatField(default=0)

    class Meta:
        unique_together = ("employee", "date")

    def save(self, *args, **kwargs):
        if self.check_in and self.check_out:
            delta = self.check_out - self.check_in
            self.total_hours = round(delta.total_seconds() / 3600, 2)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - {self.date}"


class Timesheet(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    hours_worked = models.FloatField()
    task = models.TextField()

    def __str__(self):
        return f"{self.employee} - {self.date}"


class LeaveRequest(models.Model):
    LEAVE_TYPES = [
        ("sick", "Sick Leave"),
        ("casual", "Casual Leave"),
        ("annual", "Annual Leave"),
        ("unpaid", "Unpaid Leave"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES)
    from_date = models.DateField()
    to_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    applied_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.status})"


class ShiftSwap(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    requester = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="swap_requests")
    target = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="swap_targets")
    requester_date = models.DateField()
    target_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester} ↔ {self.target} ({self.status})"
