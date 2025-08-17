# Authentication & Authorization System

## 1. Overview
The application supports two login methods:
- **Phone Login** → for **Admin** role.
- **Email Login** → for **User** role.

After logging in, the system assigns roles based on the login method.

---

## 2. Login Flow

### Phone Login (Admin)
1. User enters their **phone number**.
2. The system generates a **verification code (OTP)** and sends it to the phone number (simulated).
3. User enters the **code**.
4. The Backend (BE) verifies the code against the **database**:
   - If valid and not expired → login successful.
   - If invalid or expired → login rejected.
5. On successful login:
   - The user is assigned **role = Admin**.
   - Admin has **CRUD (Create, Read, Update, Delete) permissions on employees**.

### Email Login (User)
1. User enters their **email address**.
2. The system generates a **verification code (OTP)** and sends it to the email (simulated).
3. User enters the **code**.
4. The Backend (BE) verifies the code against the **database**:
   - If valid and not expired → login successful.
   - If invalid or expired → login rejected.
5. On successful login:
   - The user is assigned **role = User**.
   - User can access the system but **cannot perform CRUD operations on employees**.

---

## 3. Roles & Permissions
- **Admin (Phone Login)**:
  - Manage employees.
  - Create new employees.
  - Update employee information.
  - Delete employees.

- **User (Email Login)**:
  - Access the system.
  - No permissions for employee CRUD operations.

---

## 4. Backend Code Verification
When a user submits the verification code:
- Backend checks if the code exists in the database.
- Backend checks if the code is still valid (not expired).
- Backend checks if the code matches the correct user/email/phone.
- If all checks pass → authentication succeeds.
- Otherwise → login fails.

---

## 5. Summary
- **Phone Login → Admin Role → Full CRUD access on employees.**  
- **Email Login → User Role → No employee CRUD access.**  
- OTP codes are stored and validated in the **Backend (DB)** for user authentication.
