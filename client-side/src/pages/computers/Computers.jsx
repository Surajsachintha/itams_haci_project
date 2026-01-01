import React, { useState, useEffect, useMemo } from 'react';
import API_POINT from '../../axiosConfig';
import SideBar from '../SideBar';
import Modal from '../components/Modal';
import { Monitor, Cpu, Network, MapPin, Settings, Save, HardDrive, ArrowUpDown, ArrowUp, ArrowDown, CheckCircle, AlertCircle, X, ShieldCheck, Calendar, Banknote, Building2 } from 'lucide-react';

function Computers() {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const [sortOrder, setSortOrder] = useState('default'); 

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedComputer, setSelectedComputer] = useState(null);

  const [isSmartFillEnabled, setIsSmartFillEnabled] = useState(() => {
    return localStorage.getItem('isSmartFillActiveComp') === 'true';
  });
  const [hasPrediction, setHasPrediction] = useState(false);

  const [osOptions, setOsOptions] = useState([]);
  const [processorOptions, setProcessorOptions] = useState([]);
  const [ramBusOptions, setRamBusOptions] = useState([]);
  const [ramSpecOptions, setRamSpecOptions] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [vgaOptions, setVgaOptions] = useState([]);

  const [editFormData, setEditFormData] = useState({
    id: '', 
    detail_id: null,
    device_id: '',
    ip_address: '',
    anydesk_id: '',
    operating_system: '',
    processor_spec: '',
    ram_bus_type: '',
    ram_spec: '',
    hdd_capacity: '',
    ssd_capacity: '',
    vga_spec: ''
  });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const response = await API_POINT.get('/computers/computer');
      if (response.data.success) {
        setComputers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching computers:", error);
      showNotification('error', "Failed to load computer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComputers();
    const fetchDropdowns = async () => {
      try {
        const [osRes, procRes, busRes, ramRes, storageRes, vgaRes] = await Promise.all([
          API_POINT.get('/codedata/code-data?table=code_operating_system'),
          API_POINT.get('/codedata/code-data?table=code_processor_spec'),
          API_POINT.get('/codedata/code-data?table=code_bus_type'),
          API_POINT.get('/codedata/code-data?table=code_ram_spec'),
          API_POINT.get('/codedata/code-data?table=code_hdd_ssd_spec'),
          API_POINT.get('/codedata/code-data?table=code_vga_spec')
        ]);
        if (osRes.data.success) setOsOptions(osRes.data.data);
        if (procRes.data.success) setProcessorOptions(procRes.data.data);
        if (busRes.data.success) setRamBusOptions(busRes.data.data);
        if (ramRes.data.success) setRamSpecOptions(ramRes.data.data);
        if (storageRes.data.success) setStorageOptions(storageRes.data.data);
        if (vgaRes.data.success) setVgaOptions(vgaRes.data.data);
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };
    fetchDropdowns();
  }, []);

  const handleSortToggle = () => {
    if (sortOrder === 'default') setSortOrder('pending_first');
    else if (sortOrder === 'pending_first') setSortOrder('completed_first');
    else setSortOrder('default');
    setCurrentPage(1); 
  };

  const sortedComputers = useMemo(() => {
    let sorted = [...computers];
    if (sortOrder === 'pending_first') {
      sorted.sort((a, b) => (a.detail_id === null ? -1 : 1));
    } else if (sortOrder === 'completed_first') {
      sorted.sort((a, b) => (a.detail_id !== null ? -1 : 1));
    }
    return sorted;
  }, [computers, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedComputers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedComputers.length / itemsPerPage);

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    return new Array(5).fill().map((_, idx) => start + idx + 1).filter(page => page <= totalPages);
  };

  const handleSmartFillToggle = (e) => {
    const isChecked = e.target.checked;
    setIsSmartFillEnabled(isChecked);
    localStorage.setItem('isSmartFillActiveComp', isChecked);

    if (isChecked && !editFormData.detail_id) {
        const savedPattern = localStorage.getItem('computerSpecEntryPattern');
        if (savedPattern) {
            setEditFormData(prev => ({ ...prev, ...JSON.parse(savedPattern) }));
            setHasPrediction(true);
        }
    } 
    else if (!isChecked && !editFormData.detail_id) {
        setEditFormData(prev => ({
            ...prev,
            operating_system: '', processor_spec: '', ram_bus_type: '', ram_spec: '', 
            hdd_capacity: '', ssd_capacity: '', vga_spec: ''
        }));
        setHasPrediction(false);
    }
  };

  const clearPrediction = () => {
    localStorage.removeItem('computerSpecEntryPattern');
    setHasPrediction(false);
    setEditFormData(prev => ({
        ...prev,
        operating_system: '', processor_spec: '', ram_bus_type: '', ram_spec: '', 
        hdd_capacity: '', ssd_capacity: '', vga_spec: ''
    }));
  };

  const openViewModal = (computer) => {
    setSelectedComputer(computer);
    setIsViewOpen(true);
  };

  const openEditModal = (pc) => {
    const isAddMode = !pc.detail_id;
    let initialData = {
      id: pc.id,
      detail_id: pc.detail_id || null,
      device_id: pc.id,
      ip_address: pc.ip_address || '',
      anydesk_id: pc.anydesk_id || '',
      operating_system: pc.operating_system || '',
      processor_spec: pc.processor_spec || '',
      ram_bus_type: pc.ram_bus_type || '',
      ram_spec: pc.ram_spec || '',
      hdd_capacity: pc.hdd_capacity || '',
      ssd_capacity: pc.ssd_capacity || '',
      vga_spec: pc.vga_spec || null
    };

    if (isAddMode && isSmartFillEnabled) {
        const savedPattern = localStorage.getItem('computerSpecEntryPattern');
        if (savedPattern) {
            initialData = { ...initialData, ...JSON.parse(savedPattern) };
            setHasPrediction(true);
        } else {
            setHasPrediction(false);
        }
    } else {
        setHasPrediction(false);
    }

    setEditFormData(initialData);
    setIsEditOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { ...editFormData };

    Object.keys(payload).forEach((key) => {
        if (payload[key] === '') {
            payload[key] = null;
        }
    });

    try {
        let response;
        if (editFormData.detail_id) {
            response = await API_POINT.put(`/computers/computer-specs/${editFormData.detail_id}`, payload);
        } else {
            response = await API_POINT.post('/computers/computer-specs', payload);
        }

        if (response.data.success) {
            showNotification('success', editFormData.detail_id ? "Specs updated successfully!" : "Specs added successfully!");
            
            if (!editFormData.detail_id && isSmartFillEnabled) {
                const pattern = {
                    operating_system: editFormData.operating_system,
                    processor_spec: editFormData.processor_spec,
                    ram_bus_type: editFormData.ram_bus_type,
                    ram_spec: editFormData.ram_spec,
                    hdd_capacity: editFormData.hdd_capacity,
                    ssd_capacity: editFormData.ssd_capacity,
                    vga_spec: editFormData.vga_spec
                };
                localStorage.setItem('computerSpecEntryPattern', JSON.stringify(pattern));
            }

            setIsEditOpen(false);
            fetchComputers();
        } else {
            showNotification('error', "Operation failed: " + (response.data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Submit Error:", error);
        console.log("Server Error Details:", error.response?.data); 
        showNotification('error', "An error occurred while saving.");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-700 border border-green-200",
      IN_REPAIR: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      CONDEMNED: "bg-red-100 text-red-700 border border-red-200",
      TRANSIT: "bg-blue-100 text-blue-700 border border-blue-200",
    };
    return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status] || "bg-gray-100 text-gray-700"}`}>{status}</span>;
  };

  const formatAnyDesk = (id) => id ? id.toString().replace(/(\d{3})(?=\d)/g, '$1 ') : null;
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-CA') : '-';
  const formatCurrency = (value) => value ? new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(value) : '-';

  return (
    <SideBar page="Computers">
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
            <div className="flex justify-between items-center mb-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Computers Management</h1>
                    <p className="text-sm text-gray-500">Monitor PCs, Laptops & Workstations details</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Network Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specifications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none" onClick={handleSortToggle}>
                        <div className="flex items-center justify-end gap-1">
                            Actions
                            {sortOrder === 'default' && <ArrowUpDown size={14} className="text-gray-400" />}
                            {sortOrder === 'pending_first' && <ArrowUp size={14} className="text-orange-500" />}
                            {sortOrder === 'completed_first' && <ArrowDown size={14} className="text-green-600" />}
                        </div>
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                    <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading data...</td></tr>
                    ) : currentItems.map((pc) => (
                        <tr key={pc.id} className="hover:bg-gray-50 transition duration-150">
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-indigo-600">{pc.asset_tag_number}</div>
                            <div className="text-sm text-gray-900 font-medium">{pc.brand_name}</div>
                            <div className="text-xs text-gray-500">{pc.model_name}</div>
                            <div className="text-[10px] text-gray-400 mt-1">SN: {pc.serial_number}</div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1.5">
                                <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 w-fit border border-gray-200">
                                    IP: {pc.ip_address || "N/A"}
                                </span>
                                {pc.anydesk_id ? (
                                <span className="text-xs font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded w-fit border border-red-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {formatAnyDesk(pc.anydesk_id)}
                                </span>
                                ) : <span className="text-xs text-gray-400 pl-1">No AnyDesk</span>}
                            </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-800">{pc.os_name || "Unknown OS"}</span>
                            </div>
                            <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                                <span>RAM: {pc.ram_capacity} {pc.bus_type}</span>
                                <span className='truncate max-w-[150px]'>
                                    {pc.ssd_capacity_value && `SSD: ${pc.ssd_capacity_value}`}
                                    {pc.ssd_capacity_value && pc.hdd_capacity_value && " | "}
                                    {pc.hdd_capacity_value && `HDD: ${pc.hdd_capacity_value}`}
                                    {!pc.ssd_capacity_value && !pc.hdd_capacity_value && "No Storage"}
                                </span>
                            </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{pc.station_name}</div>
                            {pc.unit_name && <div className="text-xs text-gray-500">{pc.unit_name}</div>}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(pc.status)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                                <button onClick={() => openViewModal(pc)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors" title="View Full Details">View</button>
                                <button onClick={() => openEditModal(pc)} className={`px-2 py-1.5 rounded-md transition-colors flex items-center gap-1 border ${!pc.detail_id ? "text-orange-600 hover:text-orange-700 bg-orange-50 border-orange-200" : "text-gray-600 hover:text-green-700 bg-gray-50 border-gray-200 hover:border-green-200"}`} title={!pc.detail_id ? "Add Specifications" : "Update Specifications"}>
                                    <Settings size={14} /> 
                                    {!pc.detail_id && <span className="text-[10px] font-bold">+Add</span>}
                                </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {!loading && sortedComputers.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, sortedComputers.length)}</span> of <span className="font-medium">{sortedComputers.length}</span> results
                    </div>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md text-sm font-medium border text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50">Prev</button>
                        {getPaginationGroup().map((item, index) => (
                            <button key={index} onClick={() => setCurrentPage(item)} className={`px-3 py-1 rounded-md text-sm font-medium border ${currentPage === item ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                {item}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md text-sm font-medium border text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
            </div>
        </div>

        {selectedComputer && (
            <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`System Details: ${selectedComputer.asset_tag_number}`} size="max-w-4xl">
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Computer Information</div>
                            <h2 className="text-2xl font-bold text-gray-800">{selectedComputer.brand_name} {selectedComputer.model_name}</h2>
                            <p className="text-sm text-gray-500 mt-1">UUID: {selectedComputer.uuid}</p>
                        </div>
                        <div className="flex flex-col items-end justify-center">
                            {getStatusBadge(selectedComputer.status)}
                            <div className="text-sm text-gray-500 mt-2 font-mono bg-white px-2 py-1 rounded border">SN: {selectedComputer.serial_number}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                <Cpu size={18} className="text-indigo-600" />
                                <h3 className="font-bold text-gray-800">Hardware Specifications</h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><dt className="text-gray-500 text-xs">OS</dt><dd className="font-medium text-gray-900">{selectedComputer.os_name || "N/A"}</dd></div>
                                    <div><dt className="text-gray-500 text-xs">RAM</dt><dd className="font-medium text-gray-900">{selectedComputer.ram_capacity} <span className='text-xs text-gray-500'>({selectedComputer.bus_type})</span></dd></div>
                                </div>
                                <div><dt className="text-gray-500 text-xs">Processor</dt><dd className="font-medium text-gray-900 truncate" title={selectedComputer.processor_name}>{selectedComputer.processor_name || "N/A"}</dd></div>
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedComputer.ssd_capacity_value && <div><dt className="text-gray-500 text-xs flex items-center gap-1"><HardDrive size={12}/> SSD</dt><dd className="font-medium text-gray-900">{selectedComputer.ssd_capacity_value}</dd></div>}
                                    {selectedComputer.hdd_capacity_value && <div><dt className="text-gray-500 text-xs flex items-center gap-1"><HardDrive size={12}/> HDD</dt><dd className="font-medium text-gray-900">{selectedComputer.hdd_capacity_value}</dd></div>}
                                </div>
                                {selectedComputer.vga_spec_name && (
                                    <div><dt className="text-gray-500 text-xs">VGA (Graphics)</dt><dd className="font-medium text-gray-900">{selectedComputer.vga_spec_name}</dd></div>
                                )}
                            </dl>
                        </div>
                        
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 border-b pb-2">
                                <Network size={18} className="text-blue-600" />
                                <h3 className="font-bold text-gray-800">Network & Location</h3>
                            </div>
                            <dl className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><dt className="text-gray-500 text-xs">IP Address</dt><dd className="font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded border inline-block mt-1">{selectedComputer.ip_address || "Not Assigned"}</dd></div>
                                    <div><dt className="text-gray-500 text-xs">AnyDesk ID</dt><dd className="font-mono text-red-600 font-bold mt-1">{formatAnyDesk(selectedComputer.anydesk_id) || "N/A"}</dd></div>
                                </div>
                                <div className="border-t pt-3 mt-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                                        <div><dt className="text-gray-500 text-xs">Assigned Station</dt><dd className="font-medium text-gray-900">{selectedComputer.station_name}</dd><dd className="text-xs text-gray-500">{selectedComputer.unit_name}</dd></div>
                                    </div>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={18} className="text-indigo-700" />
                            <h3 className="font-bold text-indigo-900">Warranty & Purchase History</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                            <div>
                                <span className="block text-xs text-indigo-500 uppercase font-bold mb-1">Vendor</span>
                                <span className="font-medium text-indigo-900 flex items-center gap-2">
                                    <Building2 size={14} />
                                    {selectedComputer.vendor_name || "N/A"}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-indigo-500 uppercase font-bold mb-1">Purchase Date</span>
                                <span className="font-medium text-indigo-900 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {formatDate(selectedComputer.purchase_date)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-indigo-500 uppercase font-bold mb-1">Warranty Expiry</span>
                                <span className="font-medium text-red-600 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {formatDate(selectedComputer.warranty_expire_date)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs text-indigo-500 uppercase font-bold mb-1">Value</span>
                                <span className="font-bold text-gray-800 flex items-center gap-2">
                                    <Banknote size={14} />
                                    {formatCurrency(selectedComputer.purchase_value)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-indigo-200">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-700">Health Score:</span>
                                <div className="w-full bg-white rounded-full h-2.5 max-w-[200px] border border-indigo-100">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${selectedComputer.health_score}%` }}></div>
                                </div>
                                <span className="font-bold text-green-700 text-sm">{selectedComputer.health_score}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button onClick={() => setIsViewOpen(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">Close</button>
                    </div>
                </div>
            </Modal>
        )}

        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={editFormData.detail_id ? "Update Specifications" : "Add New Specifications"} size="max-w-3xl">
            <form onSubmit={handleEditSubmit} className="space-y-4">
                
                {!editFormData.detail_id && (
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

                {!editFormData.detail_id && hasPrediction && isSmartFillEnabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex justify-between items-center mb-2">
                        <div className="text-blue-700 text-xs flex items-center gap-1"><span>ℹ️ Data filled from memory.</span></div>
                        <button type="button" onClick={clearPrediction} className="text-xs text-blue-600 hover:text-blue-800 underline font-medium">Clear Data</button>
                    </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><Network size={16}/> Network Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">IP Address</label>
                            <input type="text" name="ip_address" value={editFormData.ip_address} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none" placeholder="10.x.x.x" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">AnyDesk ID</label>
                            <input type="number" name="anydesk_id" value={editFormData.anydesk_id} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Cpu size={16}/> Hardware Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Operating System</label>
                            <select name="operating_system" value={editFormData.operating_system} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">Select OS</option>
                                {osOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.codedata}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Processor</label>
                            <select name="processor_spec" value={editFormData.processor_spec} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">Select Processor</option>
                                {processorOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.processor_spec}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">RAM Bus</label>
                            <select name="ram_bus_type" value={editFormData.ram_bus_type} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">Select Bus</option>
                                {ramBusOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.bus_type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">RAM Size</label>
                            <select name="ram_spec" value={editFormData.ram_spec} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">Select Size</option>
                                {ramSpecOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.codedata}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">HDD</label>
                            <select name="hdd_capacity" value={editFormData.hdd_capacity} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">None</option>
                                {storageOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.codedata}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">SSD</label>
                            <select name="ssd_capacity" value={editFormData.ssd_capacity} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">None</option>
                                {storageOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.codedata}</option>)}
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">VGA</label>
                            <select name="vga_spec" value={editFormData.vga_spec} onChange={handleEditChange} className="w-full border border-gray-300 rounded p-2 text-sm outline-none">
                                <option value="">Integrated</option>
                                {vgaOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.vga_apec}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium">Cancel</button>
                    <button type="submit" className={`px-6 py-2 text-white rounded-lg shadow-sm text-sm font-medium flex items-center gap-2 ${editFormData.detail_id ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                        <Save size={16} /> {editFormData.detail_id ? "Update Specs" : "Save New Specs"}
                    </button>
                </div>
            </form>
        </Modal>

      </div>
    </SideBar>
  );
}

export default Computers;