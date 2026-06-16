import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_department_remove_employee_name_employee_designation_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attendance',
            name='date',
            field=models.DateField(default=django.utils.timezone.localdate),
        ),
        migrations.AlterUniqueTogether(
            name='attendance',
            unique_together={('employee', 'date')},
        ),
        migrations.CreateModel(
            name='LeaveRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('leave_type', models.CharField(
                    choices=[('sick', 'Sick Leave'), ('casual', 'Casual Leave'), ('annual', 'Annual Leave'), ('unpaid', 'Unpaid Leave')],
                    max_length=20,
                )),
                ('from_date', models.DateField()),
                ('to_date', models.DateField()),
                ('reason', models.TextField()),
                ('status', models.CharField(
                    choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                    default='pending',
                    max_length=20,
                )),
                ('applied_on', models.DateTimeField(auto_now_add=True)),
                ('employee', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.employee')),
            ],
        ),
        migrations.CreateModel(
            name='ShiftSwap',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('requester_date', models.DateField()),
                ('target_date', models.DateField()),
                ('reason', models.TextField(blank=True)),
                ('status', models.CharField(
                    choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
                    default='pending',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('requester', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='swap_requests', to='api.employee')),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='swap_targets', to='api.employee')),
            ],
        ),
    ]
