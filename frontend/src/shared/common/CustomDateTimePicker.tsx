import { LucideIcon } from 'lucide-react';
import { Controller, FieldError, useFormContext, UseFormRegisterReturn } from 'react-hook-form';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

type CustomDateTimePickerProps = {
  label?: string;
  placeholder?: string;
  icon?: LucideIcon;
  error?: FieldError;
  format?: string;
  name?: string;
  onChange?: any;
  registration?: UseFormRegisterReturn;
  disabled?: boolean;
};

const CustomDateTimePicker = ({
  label,
  placeholder = '',
  icon: Icon,
  error,
  name,
  registration,
  disabled,
  onChange,
  format = 'YYYY-MM-DD HH:mm:ss',
  ...props
}: CustomDateTimePickerProps) => {
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
              <DatePicker
                value={field.value ? dayjs(field.value) : null}
                format={format}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(date) => {
                  field.onChange(date ? date.format(format) : null);
                }}
                onBlur={field.onBlur}
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
          <DatePicker
            format={format}
            onChange={onChange}
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

export default CustomDateTimePicker;
