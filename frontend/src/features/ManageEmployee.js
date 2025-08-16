import React, { useEffect, useMemo, useState } from 'react';
import CreateEmployeeModal from '../components/CreateOrEditEmployee';
import { listEmployees, createEmployee, updateEmployee, deleteEmployee, getEmployee } from '../service/api';
import ChatModal from '../components/ChatModal';


const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ManageEmployee = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatEmployee, setChatEmployee] = useState(null);


    useEffect(() => {
        if (!notice) return;
        const t = setTimeout(() => setNotice(''), 2500);
        return () => clearTimeout(t);
    }, [notice]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [editingId, setEditingId] = useState(null);
    const [initialValues, setInitialValues] = useState({ name: '', email: '', phone: '', address: '', role: '', status: 'active' });


    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

  
    const roleOptions = useMemo(() => {
        const set = new Set((employees || []).map(e => e.role).filter(Boolean));
        return ['all', ...Array.from(set)];
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (employees || []).filter(e => {
            const matchesSearch = !q || `${e.name} ${e.email} ${e.role || ''}`.toLowerCase().includes(q);
            const matchesRole = roleFilter === 'all' || (e.role || '') === roleFilter;
            const matchesStatus = statusFilter === 'all' || (e.status || 'active') === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [employees, search, roleFilter, statusFilter]);
    console.log('filteredEmployees', filteredEmployees);
    console.log('employees', employees);
    console.log('loading', loading);
    console.log('initialValues', initialValues);
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await listEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpenCreate = () => {
        setModalMode('create');
        setEditingId(null);
        setInitialValues({ name: '', email: '', phone: '', address: '', role: '', status: 'active' });
        setIsCreateOpen(true);
    };

    const handleOpenEdit = async (emp) => {
        setModalMode('edit');
        setEditingId(emp.id);
        try {
            const full = await getEmployee(emp.id);
            setInitialValues({
                name: full.name || '',
                email: full.email || '',
                phone: full.phone || '',
                address: full.address || '',
                role: full.role || 'user',
                status: full.status || 'active',
            });
        } catch (e) {
            setInitialValues({ name: emp.name || '', email: emp.email || '', phone: emp.phone || '', address: emp.address || '', role: emp.role || 'user', status: emp.status || 'active' });
        }
        setIsCreateOpen(true);
    };

    const handleSubmit = async (values) => {
        try {
            setError('');
            if (modalMode === 'create') {
                await createEmployee(values);
                setNotice('Employee created');
            } else if (editingId) {
                await updateEmployee({ employeeId: editingId, ...values });
                setNotice('Employee updated');
            }
            await fetchEmployees();
        } catch (err) {
            setError(err.message || 'Operation failed');
            throw err; 
        }
        
    };

    const handleDelete = async (id) => {
        try {
            if (!window.confirm('Are you sure you want to delete this employee?')) return;
            setError('');
            await deleteEmployee(id);
            setNotice('Employee deleted');
            await fetchEmployees();
        } catch (err) {
            setError(err.message || 'Failed to delete employee');
        }
        
    };

    const handleOpenChat = (emp) => {
        setChatEmployee(emp);
        setIsChatOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
           
            <aside className="w-64 bg-white border-r">
                <div className="h-16 w-40 bg-gray-200 mt-6 ml-6 mb-10"></div> 
                <nav className="px-6">
                    <ul>
                        <li>
                            <button type="button" className="w-full text-left flex items-center py-2.5 px-4 bg-blue-50 text-blue-600 border-l-4 border-blue-500 font-semibold">
                                Manage Employee
                            </button>
                        </li>
                        <li>
                            <button type="button" className="w-full text-left flex items-center py-2.5 px-4 text-gray-600 hover:bg-gray-100 rounded">
                                Manage Task
                            </button>
                        </li>
                        
                    </ul>
                </nav>
            </aside>

          
            <main className="flex-1">
                
                <header className="flex justify-end items-center h-20 px-8 bg-white border-b">
                    <div className="relative">
                        <BellIcon />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                        </span>
                    </div>
                    <div className="ml-6">
                        <UserIcon />
                    </div>
                </header>

               
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Employee</h1>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-700">{filteredEmployees.length} Employee</h2>
                            <div className="flex flex-col md:flex-row gap-3 md:items-center">
                                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white">
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search name, email, role"
                                        className="outline-none text-sm"
                                    />
                                </div>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    {roleOptions.map(opt => (
                                        <option key={opt} value={opt}>{opt === 'all' ? 'All roles' : opt}</option>
                                    ))}
                                </select>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All status</option>
                                    <option value="active">Active</option>
                                    <option value="deactive">Deactive</option>
                                </select>
                                <button
                                    className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    onClick={handleOpenCreate}
                                >
                                    <span className="text-lg mr-2">+</span> Create Employee
                                </button>
                            </div>
                        </div>

                        {notice && <p className="text-green-600 mb-4">{notice}</p>}
                        {error && <p className="text-red-600 mb-4">{error}</p>}
                        {loading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-sm text-gray-500 border-b">
                                            <th className="font-medium p-4">Employee Name</th>
                                            <th className="font-medium p-4">Email</th>
                                            <th className="font-medium p-4">Role</th>
                                            <th className="font-medium p-4">Address</th>
                                            <th className="font-medium p-4">Phone</th>
                                            <th className="font-medium p-4">Status</th>
                                            <th className="font-medium p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEmployees.map((emp) => (
                                            <tr key={emp.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4 text-gray-700">{emp.name}</td>
                                                <td className="p-4 text-gray-700">{emp.email}</td>
                                                <td className="p-4 text-gray-700">{emp.role || '—'}</td>
                                                <td className="p-4 text-gray-700">{emp.address}</td>
                                                <td className="p-4 text-gray-700">{emp.phone}</td>
                                                <td className="p-4">
                                                    <span className={`${(emp.status || 'active') === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded-full text-sm font-medium`}>
                                                        {emp.status || 'active'}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex items-center space-x-2">
                                                    <button
                                                        className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600"
                                                        onClick={() => handleOpenChat(emp)}
                                                    >
                                                        Chat
                                                    </button>
                                                    <button
                                                        className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600"
                                                        onClick={() => handleOpenEdit(emp)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                                                        onClick={() => handleDelete(emp.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-6 text-center text-gray-500">No employees</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

         
            <CreateEmployeeModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleSubmit}
                mode={modalMode}
                initialValues={initialValues}
            />

            <ChatModal
                isOpen={isChatOpen}
                employee={chatEmployee}
                onClose={() => { setIsChatOpen(false); setChatEmployee(null); }}
            />
        </div>
    );
};

export default ManageEmployee;