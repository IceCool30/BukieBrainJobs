'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface SmartSuggestInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suggestions: string[];
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onBlur?: () => void;
  required?: boolean;
  name?: string;
  id?: string;
  flat?: boolean;
}

export function SmartSuggestInput({
  value,
  onChange,
  placeholder = 'Type or select...',
  suggestions,
  className = '',
  inputClassName = '',
  icon,
  disabled = false,
  onBlur,
  required = false,
  name,
  id,
  flat = false,
}: SmartSuggestInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with parent value updates
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter recommendations based on input search value
  const filteredSuggestions = suggestions.filter((item) => {
    if (!search) return true;
    return item.toLowerCase().includes(search.toLowerCase());
  });

  // Highlight suggestions limit to 12 items max for speed and cleanliness
  const visibleSuggestions = filteredSuggestions.slice(0, 15);

  const handleSelect = (item: string) => {
    onChange(item);
    setSearch(item);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onChange(val); // Bubble up immediately to keep parent in sync
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) => 
        prev < visibleSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev > 0 ? prev - 1 : visibleSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < visibleSuggestions.length) {
        handleSelect(visibleSuggestions[highlightedIndex]);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearch('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id ? `autocomplete-${id}` : undefined}>
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full outline-none font-medium transition-all text-gray-900 placeholder-gray-400 ${
            flat
              ? 'bg-transparent border-0 ring-0 focus:ring-0 text-base py-1 px-1'
              : 'bg-white border border-gray-250 rounded-xl py-3 text-sm focus:ring-2 focus:ring-[#0A192F] focus:border-transparent px-4'
          } ${
            icon ? 'pl-11' : ''
          } ${
            search ? 'pr-9' : 'pr-8'
          } ${disabled ? 'bg-gray-50 opacity-60 cursor-not-allowed' : ''} ${inputClassName}`}
          autoComplete="off"
        />

        {/* Clear Trigger Or Chevron */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
          {search && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              title="Clear input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Show list"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Floating suggestion panel */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-200 animate-in fade-in slide-in-from-top-1 duration-150">
          {visibleSuggestions.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500 font-medium">
              No matching suggestions. You can keep typing to input your custom entry.
            </div>
          ) : (
            <>
              <div className="px-4 py-1.5 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider sticky top-0 border-b border-gray-100">
                Easy picks & dynamic listings
              </div>
              {visibleSuggestions.map((item, index) => {
                const isSelected = item.toLowerCase() === value.toLowerCase();
                const isHighlighted = index === highlightedIndex;
                return (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-100 flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#0A192F]/5 text-[#0A192F]' 
                        : isHighlighted 
                          ? 'bg-gray-100/80 text-gray-900 font-semibold' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate">{item}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest shrink-0 scale-90">
                        Picked
                      </span>
                    )}
                  </button>
                );
              })}
              {filteredSuggestions.length > visibleSuggestions.length && (
                <div className="px-4 py-2 text-[10px] text-gray-400 text-center border-t border-gray-100 bg-gray-50/30">
                  + {filteredSuggestions.length - visibleSuggestions.length} more suggestions. Type to narrow search.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
