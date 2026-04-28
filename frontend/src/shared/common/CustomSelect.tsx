import { LucideIcon } from 'lucide-react';
import { Controller, FieldError, useFormContext, UseFormRegisterReturn } from 'react-hook-form';
import { Select } from 'antd';

type Option = {
  value: string;
  label: string;
};

type CustomSelectProps = {
  label?: string;
  placeholder?: string;
  icon?: LucideIcon;
  error?: FieldError;
  name?: string;
  registration?: UseFormRegisterReturn;
  disabled?: boolean;
  options: Option[];
};

const CustomSelect = ({
  label,
  placeholder = '',
  icon: Icon,
  error,
  name,
  registration,
  disabled,
  options,
  ...props
}: CustomSelectProps) => {
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
              <Select
                {...field}
                options={options.map((option) => ({ value: option.value, label: option.label }))}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full ${Icon ? 'pl-10' : ''}`}
                status={error ? 'error' : undefined}
                style={{
                  height: '48px',
                  borderRadius: '12px',
                  ...(Icon && { paddingLeft: '40px' }),
                }}
                {...props}
              />
            )}
          />
        ) : (
          <Select
            options={options.map((option) => ({ value: option.value, label: option.label }))}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full ${Icon ? 'pl-10' : ''}`}
            status={error ? 'error' : undefined}
            style={{
              height: '48px',
              borderRadius: '12px',
              ...(Icon && { paddingLeft: '40px' }),
            }}
            {...(registration ?? {})}
            {...props}
          />
        )}
      </div>

      {error && <p className='text-sm text-red-500 mt-1'>{error.message}</p>}
    </div>
  );
};

export default CustomSelect;
