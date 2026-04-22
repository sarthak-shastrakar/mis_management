import React, { useState, useRef, useEffect } from 'react';

const SearchableDropdown = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select...", 
  disabled = false,
  error = null,
  allowCustom = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-14 px-6 bg-white border ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-slate-200'} rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-300'}`}
      >
        <span className={`text-[13px] sm:text-sm font-bold truncate ${value ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[200] w-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-50">
            <input 
              autoFocus
              type="text"
              className="w-full h-11 px-4 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
              placeholder="Search or type name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
            {allowCustom && searchTerm && !options.some(o => o.toLowerCase() === searchTerm.toLowerCase()) && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(searchTerm);
                }}
                className="px-6 py-3.5 text-xs font-black text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-3 border-b border-blue-100/50"
              >
                <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[10px]">＋</span>
                <div>
                  <p className="tracking-tight">Use "{searchTerm}"</p>
                  <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Click to use custom value</p>
                </div>
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  className={`px-6 py-3.5 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${value === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-500'}`}
                >
                  {opt}
                  {value === opt && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No matching results</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {error && <p className="mt-2 ml-1 text-[10px] font-black text-rose-500 uppercase tracking-widest">{error}</p>}
    </div>
  );
};

export default SearchableDropdown;
