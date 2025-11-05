
import React, { useState, useEffect } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Input: React.FC<InputProps> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
}
export const Select: React.FC<SelectProps> = ({ label, id, children, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <select
        id={id}
        {...props}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      >
        {children}
      </select>
    </div>
);


interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
export const Textarea: React.FC<TextareaProps> = ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <textarea
        id={id}
        {...props}
        rows={3}
        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      />
    </div>
);

interface FormActionsProps {
    onCancel: () => void;
    isSubmitting: boolean;
    submitText?: string;
}
export const FormActions: React.FC<FormActionsProps> = ({ onCancel, isSubmitting, submitText = 'Save' }) => (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400"
      >
        {isSubmitting ? 'Saving...' : submitText}
      </button>
    </div>
);

interface DatalistInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  id: string;
  options: { value: string; label:string; }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const DatalistInput: React.FC<DatalistInputProps> = ({ label, id, options, selectedValue, onValueChange, ...props }) => {
    const datalistId = `${id}-list`;
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const selectedOption = options.find(opt => opt.value === selectedValue);
        setInputValue(selectedOption ? selectedOption.label : '');
    }, [selectedValue, options]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentInput = e.target.value;
        setInputValue(currentInput);

        const option = options.find(opt => opt.label === currentInput);
        if (option) {
            onValueChange(option.value);
        } else if (currentInput === '') {
            onValueChange('');
        }
    };
    
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input
                id={id}
                autoComplete="off"
                {...props}
                value={inputValue}
                list={datalistId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            <datalist id={datalistId}>
                {options.map(opt => <option key={opt.value} value={opt.label} />)}
            </datalist>
        </div>
    );
};
