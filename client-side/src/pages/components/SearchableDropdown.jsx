import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

const SearchableDropdown = ({ options, value, onChange, placeholder, displayKey, valueKey, emptyTrue, butonName, directLink }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option =>
        String(option[displayKey]).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.nic_no && String(option.nic_no).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (option.irc_no && String(option.irc_no).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (option.amis_ref_no && String(option.amis_ref_no).toLowerCase().includes(searchTerm.toLowerCase())) 
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(option => String(option[valueKey]) === String(value));

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800 flex items-center justify-between shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            >
                <span>{selectedOption ? selectedOption[displayKey] : placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                    className="absolute z-10 w-full mt-1 rounded-lg border border-gray-200 bg-white shadow-xl max-h-60 overflow-y-auto" 
                >
                    <div className="p-2 sticky top-0 bg-white border-b border-gray-100 z-20">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
                            />
                        </div>
                    </div>
                    <ul className="py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <li
                                    key={option[valueKey]}
                                    onClick={() => {
                                        onChange(option[valueKey]);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-800 transition duration-100 ease-in-out ${
                                        String(option[valueKey]) === String(value)
                                            ? 'bg-indigo-500/10 text-indigo-700 font-medium'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {String(option[valueKey]) === String(value) && <Check className="w-4 h-4" />}
                                    {option[displayKey]} - <span className='text-xs text-gray-500'>{option.nic_no || 'N/A'}</span>
                                </li>
                            ))
                        ) : (
                            emptyTrue ? (
                                <div className='flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 mx-auto max-w-sm text-center'>
                                    <p className='text-md text-gray-700 mb-4'>
                                        The search for **"{searchTerm}"** did not return any results.
                                        <br />
                                        Do you want to add this as a new **{butonName}**?
                                    </p>

                                    <button
                                        onClick={() => navigate(`/${directLink}`)}
                                        className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition shadow-lg"
                                    >
                                        <Plus className="h-4 w-4 mr-2" /> Add New {butonName}
                                    </button>
                                </div>
                                                        ) : (
                                <li className="px-4 py-2 text-gray-600 italic">No result found.</li>
                            )
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;