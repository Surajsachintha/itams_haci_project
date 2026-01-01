// src/pages/users/Users.jsx
import React, { useState, useEffect } from 'react';
import API_POINT from '../../axiosConfig';
import Modal from '../components/Modal'; 
import SideBar from '../SideBar';
import { Edit, ToggleLeft, ToggleRight, UserPlus, Shield, BadgeCheck, Mail, User, Phone, MapPin, Star, CheckCircle, AlertCircle, X } from 'lucide-react';

function Users() {
  const [users, setUsers] = useState([]);
  const [units, setUnits] = useState([]);
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    id: '',
    username: '',
    rank_id: '',
    reg_no: '',
    full_name: '',
    contact_number: '',
    email: '',
    unit_id: '', 
    role: 'USER',
    status: 1 
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  useEffect(() => {
    fetchUsers();
    fetchUnits();
    fetchRanks();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API_POINT.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification('error', 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await API_POINT.get('/codedata/code-data?table=code_sub_units');
      if (response.data.success) {
        setUnits(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const fetchRanks = async () => {
    try {
      const response = await API_POINT.get('/codedata/code-data?table=code_rank_police');
      if (response.data.success) {
        setRanks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching ranks:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: '', username: '', rank_id: '', reg_no: '', 
      full_name: '', contact_number: '', email: '', unit_id: '', role: 'USER', status: 1
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
        ...user,
        rank_id: user.rank_id || '', 
        contact_number: user.contact_number || '',
        unit_id: user.unit_id || '' 
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 1 ? 0 : 1;
    const action = newStatus === 1 ? "activate" : "deactivate";

    if(window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        
        await API_POINT.put(`/users-status/${user.id}`, {status: newStatus });
        showNotification('success', `User ${action}d successfully!`);

      } catch (error) {
        console.error("Status update failed", error);
        showNotification('error', "Failed to update status");
        fetchUsers();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { ...formData };
    delete payload.rank_name; 

    try {
      let response;
      if (isEditing) {
        response = await API_POINT.put(`/users/${formData.id}`, payload);
      } else {
        response = await API_POINT.post('/users', payload);
      }

      if (response.data.success || response.status === 200 || response.status === 201) {
          showNotification('success', isEditing ? 'User updated successfully!' : 'User created successfully!');
          fetchUsers();
          setIsModalOpen(false);
      } else {
          showNotification('error', 'Operation failed. Please check inputs.');
      }

    } catch (error) {
      console.error("Operation failed", error);
      const errorMsg = error.response?.data?.message || 'Operation failed';
      showNotification('error', errorMsg);
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(user.reg_no).includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const renderStatusBadge = (status) => {
    return status === 1 
      ? <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full border border-green-200">Active</span>
      : <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full border border-red-200">Inactive</span>;
  };

  return (
    <SideBar page="User Management">
      <div className="bg-gray-50 min-h-screen relative font-sans">
        
        {notification.show && (
            <div className={`fixed bottom-5 right-5 z-[9999] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 border-l-4 transition-all transform duration-500 ease-in-out ${notification.type === 'success' ? 'bg-white border-green-500 text-gray-800' : 'bg-white border-red-500 text-gray-800'}`}>
                {notification.type === 'success' ? <CheckCircle className="text-green-500" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
                <div>
                    <h4 className="font-bold text-sm">{notification.type === 'success' ? 'Success' : 'Error'}</h4>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                </div>
                <button onClick={() => setNotification({ ...notification, show: false })} className="ml-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
        )}

        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="relative w-full md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                type="text" 
                placeholder="Search by Name, Reg No..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={handleSearch}
                />
            </div>
            <button 
                onClick={openAddModal}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
                <UserPlus size={18} />
                Add New User
            </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                    <tr>
                    <th className="px-6 py-4 font-semibold text-gray-600">#</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Reg No</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Rank & Name</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Contact</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Username</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Unit</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
                    <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-600">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                    <tr><td colSpan="9" className="text-center py-8 text-gray-400">Loading data...</td></tr>
                    ) : currentItems.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-8 text-gray-400">No users found.</td></tr>
                    ) : (
                    currentItems.map((user, index) => (
                        <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="px-6 py-4 font-medium text-gray-400">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{user.reg_no}</td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                            <span className="font-semibold text-gray-800">{user.rank_name} {user.full_name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                            {user.contact_number ? (
                                <div className="flex items-center gap-1">
                                    <Phone size={14} className="text-gray-400"/>
                                    <span>{user.contact_number}</span>
                                </div>
                            ) : <span className="text-gray-400 text-xs">-</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.username}</td>
                        <td className="px-6 py-4 text-gray-700">{user.unit_name}</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4">{renderStatusBadge(user.status)}</td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                            <button 
                                onClick={() => openEditModal(user)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                                title="Edit User"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleStatusToggle(user)}
                                className={`p-1.5 rounded-md transition-colors focus:outline-none ${user.status === 1 ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={user.status === 1 ? "Deactivate User" : "Activate User"}
                            >
                                {user.status === 1 ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            </div>

            <div className="flex justify-between items-center mt-6 px-2">
            <span className="text-sm text-gray-500">
                Showing <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> to <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of <span className="font-medium text-gray-900">{filteredUsers.length}</span> entries
            </span>
            <div className="flex gap-2">
                <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${currentPage === 1 ? 'bg-gray-50 text-gray-300 border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                >
                Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium border rounded-lg transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                >
                    {i + 1}
                </button>
                ))}
                <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${currentPage === totalPages ? 'bg-gray-50 text-gray-300 border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                >
                Next
                </button>
            </div>
            </div>

            {isModalOpen && (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Update User Details" : "Register New User"}>
                <form onSubmit={handleSubmit} className="mt-2">
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex items-start gap-3">
                    <div className="mt-0.5 text-blue-500">
                    <BadgeCheck size={18} />
                    </div>
                    <div>
                    <h4 className="text-sm font-medium text-blue-800">User Account Information</h4>
                    <p className="text-xs text-blue-600 mt-0.5">Ensure all Police Reg No and Rank details are accurate before saving.</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                    Officer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Reg No <span className="text-red-500">*</span></label>
                        <input 
                        type="number" 
                        name="reg_no" 
                        value={formData.reg_no} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 97018"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" 
                        required 
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Rank <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select 
                            name="rank_id" 
                            value={formData.rank_id} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white appearance-none"
                            required
                            >
                                <option value="">Select Rank</option>
                                {ranks.map((rank) => (
                                    <option key={rank.id} value={rank.id}>
                                        {rank.codedata}
                                    </option>
                                ))}
                            </select>
                            <Star size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                        <input 
                        type="text" 
                        name="full_name" 
                        value={formData.full_name} 
                        onChange={handleInputChange} 
                        placeholder="Enter officer's full name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" 
                        required 
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <div className="relative">
                            <input 
                            type="text" 
                            name="contact_number" 
                            value={formData.contact_number} 
                            onChange={handleInputChange} 
                            placeholder="07x xxxxxxx"
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" 
                            />
                            <Phone size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Attached Sub Unit<span className="text-red-500">*</span></label>
                        <div className="relative">
                        <select 
                            name="unit_id" 
                            value={formData.unit_id} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white appearance-none"
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.codedata} {unit.short_code ? `(${unit.short_code})` : ''}
                                </option>
                            ))}
                        </select>
                        <MapPin size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                    </div>

                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4">
                    System Access & Roles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
                        <div className="relative">
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username} 
                            onChange={handleInputChange} 
                            placeholder="Login username"
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" 
                            required 
                        />
                        <User size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Access Role <span className="text-red-500">*</span></label>
                        <div className="relative">
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white appearance-none"
                        >
                            <option value="SUPER">SUPER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="UNIT_ADMIN">UNIT_ADMIN</option>
                            <option value="STORCE">STORCE</option>
                            <option value="TECH">TECH</option>
                            <option value="USER">USER</option>
                            <option value="STATION">STATION</option>
                        </select>
                        <Shield size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Official Email</label>
                        <div className="relative">
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            placeholder="officer@police.gov.lk"
                            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" 
                        />
                        <Mail size={16} className="absolute left-3 top-2.5 text-gray-400"/>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                    Cancel
                    </button>
                    <button 
                    type="submit" 
                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors"
                    >
                    {isEditing ? 'Update User Details' : 'Register User'}
                    </button>
                </div>
                </form>
            </Modal>
            )}
        </div>
      </div>
    </SideBar>
  );
}

export default Users;