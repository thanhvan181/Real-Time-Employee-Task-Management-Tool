// src/components/CreateOrEditEmployee.js
import React, { useEffect, useState } from 'react';

const CreateEmployeeModal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = 'create',
  initialValues = {},
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  console.log('email', email)
  const [phone, setPhone] = useState(''); 
  console.log('phone', phone)
  const [address, setAddress] = useState(''); 
  console.log('address', address)
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('active');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialValues.name || '');
      setEmail(initialValues.email || '');
      setPhone(initialValues.phone || ''); 
      setAddress(initialValues.address || ''); 
      setRole(initialValues.role || 'user');
      setStatus(initialValues.status || 'active');
      setSubmitError('');
      setSubmitting(false);
    }
  }, [isOpen, initialValues]);

  if (!isOpen) return null;

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!email.trim()) return 'Email is required';
    
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) return 'Email is invalid';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const v = validate();
    if (v) {
      setSubmitError(v);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(), 
        address: address.trim(), 
        role: role.trim(),
        status,
      });
      onClose();
    } catch (err) {
      setSubmitError(err?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={submitting ? undefined : onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {mode === 'edit' ? 'Edit Employee' : 'Create Employee'}
          </h3>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={submitting}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5">
          {submitError && (
            <div className="mb-4 text-sm text-red-600">{submitError}</div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Employee name"
              disabled={submitting}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={submitting}
            />
          </div>

         
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +84 987 654 321"
              disabled={submitting}
            />
          </div>

          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, Ward, District, City"
              disabled={submitting}
            />
          </div>

          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={submitting}
            >
              <option value="admin">admin</option>
              <option value="user">user</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={submitting}
            >
              <option value="active">Active</option>
              <option value="deactive">Deactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white ${submitting ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={submitting}
            >
              {submitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
