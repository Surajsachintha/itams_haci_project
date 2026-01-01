import React, { useState, useEffect, useMemo } from 'react';
import API_POINT from '../../axiosConfig';
import SideBar from '../SideBar';
import Modal from '../components/Modal';
import SearchableDropdown from '../components/SearchableDropdown';
import { Eye, Pencil, Trash2, X, CheckCircle, AlertCircle, Save, Plus } from 'lucide-react';

function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [stations, setStations] = useState([]);
  const [vendors, setVendors] = useState([]);      
  const [deviceTypes, setDeviceTypes] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  const [submissionSuccess, setSubmissionSuccess] = useState(0);

  const [isSmartFillEnabled, setIsSmartFillEnabled] = useState(() => {
    return localStorage.getItem('isSmartFillActiveDevice') === 'true';
  });

  const [hasPrediction, setHasPrediction] = useState(false);

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    id: null, uuid: '', asset_tag_number: '', serial_number: '', qr_code_string: '',
    category_id: '', 
    brand_id: '',    
    model_id: '',    
    type_id: '',     
    device_name: '', 
    specifications: '',
    parent_device_id: '',
    station_id: '',  
    vendor_id: '',   
    vendor_name: '', 
    purchase_date: '', warranty_expire_date: '', purchase_value: '',
    health_score: 100, status: 'ACTIVE'
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const devicesRes = await API_POINT.get('devices/device-list');
      if (devicesRes.data.success) setDevices(devicesRes.data.data);

      const [catRes, brandRes, stationRes, vendorRes] = await Promise.all([
        API_POINT.get('/codedata/code-data?table=code_categories'),
        API_POINT.get('/codedata/code-data?table=code_brand_name'),
        API_POINT.get('/codedata/code-station'),
        API_POINT.get('/codedata/code-data?table=code_vendors')
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (brandRes.data.success) setBrands(brandRes.data.data);
      if (stationRes.data.success) setStations(stationRes.data.data);
      if (vendorRes.data.success) setVendors(vendorRes.data.data);    

    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification('error', 'Failed to load initial data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const fetchDeviceTypes = async () => {
      if (!formData.category_id) {
        setDeviceTypes([]); return;
      }
      try {
        const res = await API_POINT.get(`/codedata/code-device-types/${formData.category_id}`);
        if (res.data.success) setDeviceTypes(res.data.data);
        else setDeviceTypes([]);
      } catch (error) {
        setDeviceTypes([]);
      }
    };
    fetchDeviceTypes();
  }, [formData.category_id, isModalOpen]); 

  useEffect(() => {
    const fetchModels = async () => {
      if (!formData.brand_id || !formData.type_id) {
        setModels([]); return;
      }
      try {
        const res = await API_POINT.post('/codedata/code-models', {
            type_id: formData.type_id,
            brand_id: formData.brand_id
        });
        if (res.data.success) setModels(res.data.data);
        else setModels([]);
      } catch (error) {
        setModels([]);
      }
    };
    fetchModels();
  }, [formData.brand_id, formData.type_id, isModalOpen]);

  useEffect(() => {
    const generateAssetTag = async () => {
      if (isEditMode || isViewMode || !formData.type_id) return;

      try {
        const selectedType = deviceTypes.find(t => t.id == formData.type_id);
        const shortName = selectedType ? selectedType.device_short_name : 'DEV';

        const res = await API_POINT.get('/devices/device-last-id');
        let nextId = 1;
        
        if (res.data.success && res.data.data && res.data.data.id) {
           nextId = parseInt(res.data.data.id) + 1;
        }

        const year = new Date().getFullYear().toString().slice(-2);
        const runningNumber = String(nextId).padStart(4, '0');
        const autoTag = `${shortName}-${year}-${runningNumber}`;
        
        setFormData(prev => ({ 
            ...prev, 
            asset_tag_number: autoTag,
            qr_code_string: autoTag 
        }));

      } catch (error) {
        console.error("Error generating tag:", error);
      }
    };
    generateAssetTag();
  }, [formData.type_id, isEditMode, isViewMode, deviceTypes, submissionSuccess]);


  const filteredDevices = devices.filter((device) => {
    if (searchTerm === "") return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (device.asset_tag_number && device.asset_tag_number.toLowerCase().includes(lowerSearch)) ||
      (device.serial_number && device.serial_number.toLowerCase().includes(lowerSearch)) ||
      (device.brand_name && device.brand_name.toLowerCase().includes(lowerSearch)) ||
      (device.model_name && device.model_name.toLowerCase().includes(lowerSearch)) ||
      (device.station_name && device.station_name.toLowerCase().includes(lowerSearch)) ||
      (device.qr_code_string && device.qr_code_string.toLowerCase().includes(lowerSearch))
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    return new Array(5).fill().map((_, idx) => start + idx + 1).filter(page => page <= totalPages);
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-CA') : '-';
  const formatCurrency = (value) => value ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(value) : '0.00';
  
  const getStatusBadge = (status) => {
    const styles = {
      'ACTIVE': 'bg-green-100 text-green-800 border-green-200',
      'IN_REPAIR': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'CONDEMNED': 'bg-red-100 text-red-800 border-red-200',
      'TRANSIT': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'asset_tag_number') updatedFormData.qr_code_string = value;
    if (name === 'category_id') { updatedFormData.type_id = ''; updatedFormData.model_id = ''; }
    if (name === 'brand_id') { updatedFormData.model_id = ''; }
    if (name === 'type_id') { updatedFormData.model_id = ''; }

    setFormData(updatedFormData);
  };

  const parentDeviceOptions = useMemo(() => {
    return devices
        .filter(d => d.id !== formData.id)
        .map(d => ({
            ...d,
            display_name: `${d.asset_tag_number} - ${d.brand_name} ${d.model_name}`
        }));
  }, [devices, formData.id]);

  const handleSmartFillToggle = (e) => {
      const isChecked = e.target.checked;
      setIsSmartFillEnabled(isChecked);
      localStorage.setItem('isSmartFillActiveDevice', isChecked);

      if (isChecked) {
          const savedPattern = localStorage.getItem('deviceEntryPattern');
          if (savedPattern) {
              const parsedPattern = JSON.parse(savedPattern);
              setFormData(prev => ({
                  ...prev,
                  ...parsedPattern,
                  id: null, uuid: '', asset_tag_number: '', serial_number: '', qr_code_string: '',
                  parent_device_id: '' 
              }));
              setHasPrediction(true);
          }
      } else {
          setFormData({
            id: null, uuid: '', asset_tag_number: '', serial_number: '', qr_code_string: '',
            category_id: '', brand_id: '', model_id: '', type_id: '', device_name: '', specifications: '',
            parent_device_id: '',
            station_id: '', vendor_id: '', vendor_name: '', purchase_date: '', warranty_expire_date: '',
            purchase_value: '', health_score: 100, status: 'ACTIVE'
          });
          setHasPrediction(false);
          setDeviceTypes([]); setModels([]);
      }
  };

  const clearPrediction = () => {
      localStorage.removeItem('deviceEntryPattern');
      setHasPrediction(false);
      setFormData({
        id: null, uuid: '', asset_tag_number: '', serial_number: '', qr_code_string: '',
        category_id: '', brand_id: '', model_id: '', type_id: '', device_name: '', specifications: '',
        parent_device_id: '',
        station_id: '', vendor_id: '', vendor_name: '', purchase_date: '', warranty_expire_date: '',
        purchase_value: '', health_score: 100, status: 'ACTIVE'
      });
      setDeviceTypes([]); setModels([]);
  };

  const openAddModal = () => {
    setIsViewMode(false); setIsEditMode(false);
    setDeviceTypes([]); setModels([]);
    
    const smartFillActive = localStorage.getItem('isSmartFillActiveDevice') === 'true';
    setIsSmartFillEnabled(smartFillActive);

    let initialData = {
      id: null, uuid: '', asset_tag_number: '', serial_number: '', qr_code_string: '',
      category_id: '', brand_id: '', model_id: '', type_id: '', device_name: '', specifications: '',
      parent_device_id: '',
      station_id: '', vendor_id: '', vendor_name: '', purchase_date: '', warranty_expire_date: '',
      purchase_value: '', health_score: 100, status: 'ACTIVE'
    };

    if (smartFillActive) {
        const savedPattern = localStorage.getItem('deviceEntryPattern');
        if (savedPattern) {
            initialData = { ...initialData, ...JSON.parse(savedPattern) };
            setHasPrediction(true);
        } else { setHasPrediction(false); }
    } else { setHasPrediction(false); }

    setFormData(initialData);
    setIsModalOpen(true);
  };

  const openEditModal = (device) => {
    setIsViewMode(false); setIsEditMode(true);
    const formatForInput = (dateString) => dateString ? dateString.split('T')[0] : '';
    setFormData({
      ...device,
      purchase_date: formatForInput(device.purchase_date),
      warranty_expire_date: formatForInput(device.warranty_expire_date),
      category_id: device.category_id || '',
      brand_id: device.brand_id || '',
      model_id: device.model_id || '',
      station_id: device.station_id || '',
      type_id: device.type_id || '',      
      vendor_id: device.vendor_id || '',
      parent_device_id: device.parent_device_id || ''
    });
    setIsModalOpen(true);
  };

  const openViewModal = (device) => { setIsViewMode(true); setIsEditMode(false); setIsModalOpen(true); setFormData(device); };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
        return;
    }

    try {
        const res = await API_POINT.delete(`/devices/device/${id}`);
        if (res.data.success) {
            showNotification('success', 'Device deleted successfully.');
            fetchAllData(); 
        } else {
            showNotification('error', res.data.message || 'Failed to delete device.');
        }
    } catch (error) {
        console.error("Delete Error:", error);
        showNotification('error', 'An error occurred while deleting.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formatDateForDB = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toISOString().split('T')[0];
    };

    const payload = {
        ...formData,
        purchase_date: formatDateForDB(formData.purchase_date),
        warranty_expire_date: formatDateForDB(formData.warranty_expire_date),
        parent_device_id: formData.parent_device_id === '' ? null : formData.parent_device_id
    };

    try {
        let response;
        if (isEditMode) {
            response = await API_POINT.put(`/devices/device/${formData.id}`, payload);
        } else {
            response = await API_POINT.post('/devices/device', payload);
        }

        if (response.data.success) {
            showNotification('success', isEditMode ? 'Device updated successfully!' : 'Device registered successfully!');
            
            if (isSmartFillEnabled) {
                const patternToSave = {
                    category_id: formData.category_id, brand_id: formData.brand_id, type_id: formData.type_id, model_id: formData.model_id,
                    station_id: formData.station_id, vendor_id: formData.vendor_id, purchase_date: formData.purchase_date,
                    warranty_expire_date: formData.warranty_expire_date, purchase_value: formData.purchase_value, specifications: formData.specifications
                };
                localStorage.setItem('deviceEntryPattern', JSON.stringify(patternToSave));
            }

            fetchAllData(); 

            if (isEditMode) {
                setIsModalOpen(false);
            } else {
                setSubmissionSuccess(prev => prev + 1);

                if (isSmartFillEnabled) {
                    setFormData(prev => ({
                        ...prev,
                        id: null,
                        uuid: '',
                        asset_tag_number: 'Generating...', 
                        serial_number: '',
                        qr_code_string: '',
                    }));
                } else {
                    setFormData({
                        id: null, uuid: '', asset_tag_number: '', serial_number: '', qr_code_string: '',
                        category_id: '', brand_id: '', model_id: '', type_id: '', device_name: '', specifications: '',
                        parent_device_id: '',
                        station_id: '', vendor_id: '', vendor_name: '', purchase_date: '', warranty_expire_date: '',
                        purchase_value: '', health_score: 100, status: 'ACTIVE'
                    });
                    setDeviceTypes([]); 
                    setModels([]);
                }
            }

        } else {
            showNotification('error', response.data.message || 'Operation failed.');
        }

    } catch (error) {
        console.error("Submit Error:", error);
        const errorMsg = error.response?.data?.error?.sqlMessage || 'An error occurred. Please try again.';
        showNotification('error', errorMsg);
    }
  };

  return (
    <SideBar page="Devices">
      <div className="bg-gray-50 min-h-screen relative">
        
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

        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Device Inventory</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage hardware assets, warranty, and locations.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input type="text" placeholder="Search by Tag, Serial or QR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full sm:w-72 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm" />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm font-medium transition duration-200 flex items-center justify-center gap-2">
                        <Plus size={18} /> Add Device
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warranty & Value</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading devices...</td></tr>
                    ) : currentItems.length === 0 ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No matching devices found.</td></tr>
                    ) : (
                    currentItems.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50 transition duration-150 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-blue-600">{device.asset_tag_number}</div>
                            <div className="text-xs text-gray-500">SN: {device.serial_number}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{device.uuid}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{device.brand_name} {device.model_name}</div>
                            <div className="text-sm text-gray-500">{device.device_name}</div>
                            <div className="text-xs text-gray-400 truncate max-w-xs">{device.specifications}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{device.station_name}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-500">Purchased: {formatDate(device.purchase_date)}</div>
                            <div className="text-xs text-red-500 font-medium">Expires: {formatDate(device.warranty_expire_date)}</div>
                            <div className="text-sm font-semibold text-gray-700 mt-1">{formatCurrency(device.purchase_value)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            {getStatusBadge(device.status)}
                            <div className="text-xs text-gray-400 mt-1">Health: {device.health_score}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                            <button onClick={() => openViewModal(device)} className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200" title="View"><Eye size={18} strokeWidth={2} /></button>
                            <button onClick={() => openEditModal(device)} className="p-2 rounded-full text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition-colors duration-200" title="Edit"><Pencil size={18} strokeWidth={2} /></button>
                            <button onClick={() => handleDelete(device.id)} className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200" title="Delete"><Trash2 size={18} strokeWidth={2} /></button>
                            </div>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
            {!loading && filteredDevices.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredDevices.length)}</span> of <span className="font-medium">{filteredDevices.length}</span> results</div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md text-sm font-medium border text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50">Prev</button>
                    {getPaginationGroup().map((item, index) => (<button key={index} onClick={() => setCurrentPage(item)} className={`px-3 py-1 rounded-md text-sm font-medium border ${currentPage === item ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{item}</button>))}
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md text-sm font-medium border text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                </div>
                </div>
            )}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isViewMode ? `Details: ${formData.asset_tag_number}` : (isEditMode ? "Edit Device Details" : "Register New Device")} size="max-w-4xl">
          {isViewMode ? (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Asset Tag</div>
                        <div className="text-2xl font-bold text-blue-700">{formData.asset_tag_number}</div>
                        <div className="text-sm text-gray-500 mt-1">UUID: {formData.uuid}</div>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Status</div>
                        <div>{getStatusBadge(formData.status)}</div>
                        <div className="text-sm text-gray-500 mt-1">Health: {formData.health_score}%</div>
                    </div>
                    <div className="flex-1">
                          <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Current Value</div>
                          <div className="text-xl font-semibold text-gray-800">{formatCurrency(formData.purchase_value)}</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Device Information</h4>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-gray-500">Brand:</dt> <dd className="font-medium">{formData.brand_name}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Model:</dt> <dd className="font-medium">{formData.model_name}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Type:</dt> <dd className="font-medium">{formData.device_name}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">Serial No:</dt> <dd className="font-medium">{formData.serial_number}</dd></div>
                            <div className="flex justify-between"><dt className="text-gray-500">QR Code:</dt> <dd className="font-medium text-xs font-mono bg-gray-100 px-1 rounded">{formData.qr_code_string}</dd></div>
                        </dl>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Location & Assignment</h4>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-gray-500">Station:</dt> <dd className="font-medium">{formData.station_name}</dd></div>
                        </dl>
                        <div className="mt-4">
                            <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-3">Specifications</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">{formData.specifications || "No specifications recorded."}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-2 mb-3">Purchase & Warranty Info</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                          <div><span className="block text-xs text-blue-500 uppercase font-bold">Vendor</span><span className="font-medium text-blue-900">{formData.vendor_name}</span></div>
                          <div><span className="block text-xs text-blue-500 uppercase font-bold">Purchased Date</span><span className="font-medium text-blue-900">{formatDate(formData.purchase_date)}</span></div>
                          <div><span className="block text-xs text-blue-500 uppercase font-bold">Warranty Expiry</span><span className="font-medium text-red-600">{formatDate(formData.warranty_expire_date)}</span></div>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition font-medium">Close</button>
                    <button onClick={() => openEditModal(formData)} className="ml-3 px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium">Edit This Device</button>
                </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {!isEditMode && (
                    <div className="flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-200 mb-2">
                        <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span>Enable Smart Fill (Auto-fill from last entry)</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isSmartFillEnabled} onChange={handleSmartFillToggle} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                )}

                {!isEditMode && hasPrediction && isSmartFillEnabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex justify-between items-center mb-2">
                        <div className="text-blue-700 text-xs flex items-center gap-1"><span>ℹ️ Data filled from memory.</span></div>
                        <button type="button" onClick={clearPrediction} className="text-xs text-blue-600 hover:text-blue-800 underline font-medium">Clear Data</button>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b pb-2">Identification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Asset Tag (Auto)</label>
                      <input type="text" name="asset_tag_number" value={formData.asset_tag_number} readOnly={true} className="w-full border border-gray-300 rounded p-2 text-sm font-bold text-blue-800 bg-gray-100 cursor-not-allowed focus:ring-0 outline-none" placeholder="Generated after Type selection..." />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Serial Number *</label>
                      <input type="text" name="serial_number" value={formData.serial_number} onChange={handleInputChange} required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b pb-2">Hardware Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Brand *</label>
                      <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Select Brand</option>
                        {brands.map(brand => (<option key={brand.id} value={brand.id}>{brand.brand_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                      <select name="category_id" value={formData.category_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Select Category</option>
                        {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.category_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Device Type *</label>
                      <select name="type_id" value={formData.type_id} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" disabled={!formData.category_id}>
                        <option value="">Select Type</option>
                        {deviceTypes.map(type => (<option key={type.id} value={type.id}>{type.device_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Model *</label>
                      <select name="model_id" value={formData.model_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100" disabled={!formData.brand_id || !formData.type_id}>
                        <option value="">Select Model</option>
                        {models.map(model => (<option key={model.id} value={model.id}>{model.model_name}</option>))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Parent Device (Optional)</label>
                        <SearchableDropdown
                            options={parentDeviceOptions}
                            value={formData.parent_device_id}
                            onChange={(value) => setFormData({ ...formData, parent_device_id: value })}
                            placeholder="Search Parent Device..."
                            displayKey="display_name"
                            valueKey="id"
                            emptyTrue={false} 
                        />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Specifications</label>
                      <textarea name="specifications" value={formData.specifications} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" rows="1"></textarea>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b pb-2">Location</h4>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Station *</label>
                            <select name="station_id" value={formData.station_id} onChange={handleInputChange} required className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                              <option value="">Select Station</option>
                              {stations.map(station => (<option key={station.station_id} value={station.station_id}>{station.station_name}</option>))}
                            </select>
                        </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b pb-2">Status & Health</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Current Status</label>
                            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="IN_REPAIR">IN_REPAIR</option>
                                <option value="CONDEMNED">CONDEMNED</option>
                                <option value="TRANSIT">TRANSIT</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Health Score (%)</label>
                            <input type="number" name="health_score" value={formData.health_score} onChange={handleInputChange} min="0" max="100" className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-800 uppercase mb-3 border-b border-blue-200 pb-2">Purchase & Warranty</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Vendor</label>
                      <select name="vendor_id" value={formData.vendor_id} onChange={handleInputChange} className="w-full border border-blue-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="">Select Vendor</option>
                        {vendors.map(vendor => (<option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Purchase Date</label>
                      <input type="date" name="purchase_date" value={formData.purchase_date} onChange={handleInputChange} className="w-full border border-blue-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Warranty Expire</label>
                      <input type="date" name="warranty_expire_date" value={formData.warranty_expire_date} onChange={handleInputChange} className="w-full border border-blue-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-700 mb-1">Value (LKR)</label>
                      <input type="number" name="purchase_value" value={formData.purchase_value} onChange={handleInputChange} step="0.01" className="w-full border border-blue-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition text-sm font-medium">Cancel</button>
                  <button type="submit" className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition text-sm font-medium">{isEditMode ? 'Update Device' : 'Register Device'}</button>
                </div>
            </form>
          )}
        </Modal>

      </div>
    </SideBar>
  );
}

export default Devices;