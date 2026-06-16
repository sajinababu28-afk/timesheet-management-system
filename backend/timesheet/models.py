from django.db import models
from accounts.models import Employee

class Timesheet(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    hours_worked = models.DecimalField(max_digits=4, decimal_places=1)
    task_description = models.TextField()

    def __str__(self):
        return f"{self.employee.name} - {self.date}"
