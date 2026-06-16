# Timesheet Management System

A full-stack Timesheet Management System built using React, Django REST Framework, SQLite, and JWT Authentication.

## Project Overview

The Timesheet Management System is designed to help organizations manage employee attendance, timesheets, leave requests, and workforce productivity through a modern web application.

## Features

### Authentication

* Secure Login System
* JWT Authentication
* Protected Routes

### Employee Management

* Add Employees
* View Employee Details
* Update Employee Information
* Manage Employee Records

### Attendance Management

* Check-In Functionality
* Check-Out Functionality
* Attendance Tracking
* Daily Attendance Records

### Timesheet Management

* Create Timesheets
* Update Timesheets
* Delete Timesheets
* Track Hours Worked
* Task Description Management

### Leave Management

* Apply for Leave
* Approve/Reject Leave Requests
* Leave Tracking

### Dashboard

* Attendance Summary
* Employee Statistics
* Timesheet Overview
* Activity Monitoring

## Tech Stack

### Frontend

* React.js
* Vite
* Bootstrap
* Axios
* React Router

### Backend

* Django
* Django REST Framework
* JWT Authentication
* SQLite

## Project Structure

timesheet-management-system/

├── backend/

│   ├── api/

│   ├── accounts/

│   ├── manage.py

│   └── requirements.txt

│

├── frontend/

│   ├── src/

│   ├── public/

│   ├── package.json

│   └── vite.config.js

│

└── README.md

## Installation

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

## Future Enhancements

* QR Code Attendance
* Payroll Management
* Email Notifications
* Employee Performance Tracking
* Advanced Analytics Dashboard
* Export Reports to PDF/Excel

## Author

Sajina Babu

## License

This project is licensed under the MIT License.
