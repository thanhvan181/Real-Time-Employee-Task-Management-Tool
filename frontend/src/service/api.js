const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:4000';


export const API_BASE_URL = BASE_URL;

async function handleResponse(res, defaultMsg) {
  if (res.ok) return res.json();
  const data = await res.json().catch(() => ({}));
  throw new Error(data.error || defaultMsg);
}


export async function createOwnerAccessCode(phoneNumber) {
  const res = await fetch(`${BASE_URL}/owner/CreateNewAccessCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });
  return handleResponse(res, 'Failed to send code');
}

export async function validateOwnerAccessCode(accessCode, phoneNumber) {
  const res = await fetch(`${BASE_URL}/owner/ValidateAccessCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode, phoneNumber }),
  });
  return handleResponse(res, 'Invalid code');
}


export async function loginEmail(email) {
  const res = await fetch(`${BASE_URL}/employee/LoginEmail`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res, 'Failed to send email code');
}

export async function validateEmployeeAccessCode(accessCode, email) {
  const res = await fetch(`${BASE_URL}/employee/ValidateAccessCode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessCode, email }),
  });
  return handleResponse(res, 'Invalid email code');
}


export async function getEmployee(employeeId) {
  const res = await fetch(`${BASE_URL}/owner/GetEmployee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });
  return handleResponse(res, 'Employee not found');
}

export async function createEmployee({ name, email, phone, address, role, status }) {
  const res = await fetch(`${BASE_URL}/owner/CreateEmployee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, address, role, status }),
  });
  return handleResponse(res, 'Failed to create employee');
}

export async function deleteEmployee(employeeId) {
  const res = await fetch(`${BASE_URL}/owner/DeleteEmployee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });
  return handleResponse(res, 'Failed to delete employee');
}

export async function listEmployees() {
  const res = await fetch(`${BASE_URL}/owner/ListEmployees`, {
    method: 'GET',
  });
  return handleResponse(res, 'Failed to list employees');
}

export async function updateEmployee({ employeeId, name, email, phone, address, role, status }) {
  const res = await fetch(`${BASE_URL}/owner/UpdateEmployee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId, name, email, phone, address, role, status }),
  });
  return handleResponse(res, 'Failed to update employee');
}


export async function getChatHistory(employeeId) {
  const url = `${BASE_URL}/owner/ChatHistory?employeeId=${encodeURIComponent(employeeId)}`;
  const res = await fetch(url, { method: 'GET' });
  return handleResponse(res, 'Failed to load chat history');
}
