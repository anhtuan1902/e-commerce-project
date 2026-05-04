import { LucideIcon } from 'lucide-react';
import { Controller, FieldError, useFormContext } from 'react-hook-form';

type CustomInputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  icon?: LucideIcon;
  rows?: number;
  error?: FieldError;
  name: string;
  disabled?: boolean;
  autoComplete?: string;
};

const CustomInput = ({
  label,
  type = 'text',
  placeholder = '',
  autoComplete,
  icon: Icon,
  rows = 3,
  error,
  name,
  disabled,
}: CustomInputProps) => {
  const methods = useFormContext();
  const control = methods?.control;

  const baseClass = `w-full pr-4 py-3 border rounded-xl focus:ring-2 focus:outline-none
    ${Icon ? 'pl-10' : 'pl-4'}
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1E3A8A]'}
    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
  `;

  return (
    <div className='mb-4'>
      {label && <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>}

      <div className='relative'>
        {Icon && (
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10'>
            <Icon className='h-5 w-5 text-gray-400' />
          </div>
        )}

        {control && name ? (
          <Controller
            name={name}
            control={control}
            render={({ field }) =>
              type === 'textarea' ? (
                <textarea
                  {...field}
                  rows={rows}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={baseClass}
                />
              ) : (
                <input
                  {...field}
                  type={type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={baseClass}
                />
              )
            }
          />
        ) : (
          <input
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={disabled}
            className={baseClass}
          />
        )}
      </div>

      {error && <p className='text-sm text-red-500 mt-1'>{error.message}</p>}
    </div>
  );
};

export default CustomInput;
