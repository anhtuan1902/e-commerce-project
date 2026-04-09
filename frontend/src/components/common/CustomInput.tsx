import { LucideIcon } from 'lucide-react';
import { Controller, FieldError, useFormContext, UseFormRegisterReturn } from 'react-hook-form';

type CustomInputProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  icon?: LucideIcon;
  error?: FieldError;
  name?: string;
  registration?: UseFormRegisterReturn;
  disabled?: boolean;
};

const CustomInput = ({
  label,
  type = 'text',
  placeholder = '',
  icon: Icon,
  error,
  name,
  registration,
  disabled,
  ...props
}: CustomInputProps) => {
  const methods = useFormContext();
  const control = methods?.control;

  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-700 mb-1'>{label}</label>

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
            render={({ field }) => (
              <input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                {...props}
                className={`w-full pr-4 py-3 border rounded-xl focus:ring-2 focus:outline-none
                  ${Icon ? 'pl-10' : 'pl-4'}
                  ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1E3A8A]'}
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                `}
              />
            )}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            {...(registration ?? {})}
            name={name}
            disabled={disabled}
            {...props}
            className={`w-full pr-4 py-3 border rounded-xl focus:ring-2 focus:outline-none
              ${Icon ? 'pl-10' : 'pl-4'}
              ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1E3A8A]'}
              disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
            `}
          />
        )}
      </div>

      {error && <p className='text-sm text-red-500 mt-1'>{error.message}</p>}
    </div>
  );
};

export default CustomInput;
