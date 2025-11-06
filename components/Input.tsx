
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, icon, ...props }) => (
  <div>
    <label htmlFor={props.id} className="block mb-2 text-sm font-medium text-slate-300">
      {label}
    </label>
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">{icon}</div>}
      <input
        type="number"
        className={`bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 ${icon ? 'pl-10' : ''}`}
        {...props}
      />
    </div>
  </div>
);

export default Input;
