import React, { useState, useEffect } from 'react';
import SideBar from '../SideBar';
import API_POINT from '../../axiosConfig';
import Modal from '../components/Modal'; 
import { Pencil, Trash2, Plus, Save, X, CheckCircle, AlertCircle } from 'lucide-react';

function Settings() {
  const [codeTables, setCodeTables] = useState([]); 
  const [selectedTable, setSelectedTable] = useState(''); 
  
  const [tableData, setTableData] = useState([]); 
  const [columns, setColumns] = useState([]); 
  
  const [tableKeys, setTableKeys] = useState([]); 
  const [referenceData, setReferenceData] = useState({}); 
  const [dropdownOptions, setDropdownOptions] = useState({}); 

  const [loadingList, setLoadingList] = useState(true); 
  const [loadingTable, setLoadingTable] = useState(false); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
        setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  useEffect(() => {
    const fetchCodeTables = async () => {
      try {
        const response = await API_POINT.get('/codedata/code-data?table=code_codetable');
        if (response.data.success) setCodeTables(response.data.data);
      } catch (error) {
        console.error("Error loading settings:", error);
        showNotification('error', "Failed to load table list.");
      } finally {
        setLoadingList(false);
      }
    };
    fetchCodeTables();
  }, []);

  const fetchTableInfo = async () => {
    if (!selectedTable) return;
    setLoadingTable(true);
    try {
      const dataRes = await API_POINT.get(`/codedata/code-data?table=${selectedTable}`);
      if (dataRes.data.success && dataRes.data.data.length > 0) {
        setTableData(dataRes.data.data);
        setColumns(Object.keys(dataRes.data.data[0])); 
      } else {
        setTableData([]);
        setColumns([]);
      }

      const keysRes = await API_POINT.post('/codedata/code-table-keys', { code_table: selectedTable });

      if (keysRes.data.success) {
          const keys = keysRes.data.data;
          setTableKeys(keys);

          const newReferenceData = {};
          const newDropdownOptions = {};

          const fetchPromises = keys.map(async (keyItem) => {
              if (keyItem.input_type === 'SELECT') {
                  try {
                      const refRes = await API_POINT.post('/codedata/code-table-data', {
                          code_id: keyItem.code_id,
                          code_name: keyItem.code_name,
                          codetable_name: keyItem.codetable_name
                      });

                      if (refRes.data.success) {
                          const lookupMap = {};
                          refRes.data.data.forEach(item => {
                              lookupMap[item[keyItem.code_id]] = item[keyItem.code_name];
                          });
                          newReferenceData[keyItem.column_name] = lookupMap;

                          newDropdownOptions[keyItem.column_name] = refRes.data.data.map(item => ({
                              value: item[keyItem.code_id],
                              label: item[keyItem.code_name]
                          }));
                      }
                  } catch (err) {
                      console.error(`Error fetching reference for ${keyItem.column_name}`, err);
                  }
              }
          });

          await Promise.all(fetchPromises);
          setReferenceData(newReferenceData);
          setDropdownOptions(newDropdownOptions);
      } else {
          setTableKeys([]);
          setReferenceData({});
          setDropdownOptions({});
      }

    } catch (error) {
      console.error("Error fetching table info:", error);
      showNotification('error', "Failed to load table data.");
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
        setTableData([]); 
        fetchTableInfo();
    }
  }, [selectedTable]);

  const handleAdd = () => {
    setFormData({}); 
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setFormData({ ...row }); 
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this record?")) return;

    try {
        const res = await API_POINT.delete('/codedata/dynamic-delete', { 
            data: { table: selectedTable, id: id } 
        });

        if (res.data.success) {
            showNotification('success', "Record deleted successfully!");
            fetchTableInfo();
        } else {
            showNotification('error', "Failed to delete record.");
        }
    } catch (error) {
        console.error("Delete error:", error);
        showNotification('error', "Error occurred while deleting.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        let res;
        if (isEditMode) {
            res = await API_POINT.put('/codedata/dynamic-update', {
                table: selectedTable,
                id: formData.id,
                data: formData
            });
        } else {
            res = await API_POINT.post('/codedata/dynamic-insert', {
                table: selectedTable,
                data: formData
            });
        }

        if (res.data.success) {
            showNotification('success', isEditMode ? "Updated Successfully!" : "Added Successfully!");
            setIsModalOpen(false);
            fetchTableInfo();
        } else {
            showNotification('error', "Operation Failed: " + (res.data.message || "Unknown error"));
        }

    } catch (error) {
        console.error("Submit Error:", error);
        showNotification('error', "An error occurred. Check console.");
    }
  };

  const handleTableChange = (e) => setSelectedTable(e.target.value);
  
  const formatHeader = (header) => header.replace(/_/g, ' ').toUpperCase();

  const renderCellContent = (colName, value) => {
    if (referenceData[colName] && referenceData[colName][value]) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{referenceData[colName][value]}</span>;
    }
    return value;
  };

  const getInputType = (colName) => {
      const keyInfo = tableKeys.find(k => k.column_name === colName);
      return keyInfo ? keyInfo.input_type : 'TEXT';
  };

  return (
    <SideBar page="Settings">
      <div className="p-6 bg-gray-50 min-h-screen relative">
        
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

        <div className="flex justify-between items-end mb-6">
            <div className="max-w-md w-full">
                <label className="block mb-2 text-sm font-medium text-gray-700">Select Code Table</label>
                <select id="codeTables" value={selectedTable} onChange={handleTableChange} disabled={loadingList} className="block w-full px-3 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none">
                    <option value="">{loadingList ? "Loading..." : "Choose a table..."}</option>
                    {!loadingList && codeTables.map((item) => (
                    <option key={item.id} value={item.table_name_id}>{item.table_name}</option>
                    ))}
                </select>
            </div>
            {selectedTable && (
                <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition">
                    <Plus size={18} /> Add New Record
                </button>
            )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-700">
                    {selectedTable ? `Data: ${codeTables.find(t => t.table_name_id === selectedTable)?.table_name || selectedTable}` : 'Table Data'}
                </h2>
            </div>

            <div className="overflow-x-auto">
                {loadingTable ? (
                    <div className="p-10 text-center text-gray-500">Loading table data...</div>
                ) : !selectedTable ? (
                    <div className="p-10 text-center text-gray-400">Please select a table to view data.</div>
                ) : tableData.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No records found in this table.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        {formatHeader(col)}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50 transition duration-150">
                                    {columns.map((col, colIndex) => (
                                        <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {renderCellContent(col, row[col])}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(row)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Record" : "Add New Record"} size="max-w-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                {columns.map((col) => {
                    if (col === 'id') return null;

                    const inputType = getInputType(col);
                    const label = formatHeader(col);

                    return (
                        <div key={col}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                            
                            {inputType === 'SELECT' && dropdownOptions[col] ? (
                                <select 
                                    name={col} 
                                    value={formData[col] || ''} 
                                    onChange={handleInputChange} 
                                    className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select {label}</option>
                                    {dropdownOptions[col].map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input 
                                    type="text" 
                                    name={col} 
                                    value={formData[col] || ''} 
                                    onChange={handleInputChange} 
                                    className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            )}
                        </div>
                    );
                })}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm font-medium">Cancel</button>
                    <button type="submit" className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm text-sm font-medium flex items-center gap-2">
                        <Save size={16} /> {isEditMode ? "Update" : "Save"}
                    </button>
                </div>
            </form>
        </Modal>

      </div>
    </SideBar>
  );
}

export default Settings;