import React from 'react';

interface FormSwitchProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const FormSwitch: React.FC<FormSwitchProps> = ({
  id,
  checked = false,
  onCheckedChange,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <label
      htmlFor={id}
      className={`relative inline-flex items-center cursor-pointer ${className}`}
    >
      <input
        type='checkbox'
        id={id}
        checked={checked}
        onChange={handleChange}
        className='sr-only'
      />
      <div
        className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 ${
          checked ? 'bg-blue-600' : ''
        } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
      ></div>
    </label>
  );
};

FormSwitch.displayName = 'FormSwitch';
