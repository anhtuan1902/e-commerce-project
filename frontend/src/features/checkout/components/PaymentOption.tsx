import { CreditCard, Smartphone, Truck, Building2 } from 'lucide-react';
import { memo, useCallback } from 'react';
import type { PaymentMethod } from '../types/checkout.types';

interface PaymentOptionProps {
  id: PaymentMethod;
  label: string;
  description: string;
  isSelected: boolean;
  disabled?: boolean;
  onSelect: (id: PaymentMethod) => void;
}

const getPaymentIcon = (methodId: PaymentMethod, isActive: boolean) => {
  const iconProps = { className: `w-6 h-6 ${isActive ? 'text-indigo-600' : 'text-slate-400'}` };

  switch (methodId) {
    case 'cod':
      return <Truck {...iconProps} />;
    case 'momo':
      return <Smartphone {...iconProps} />;
    case 'vnpay':
      return <Building2 {...iconProps} />;
    default:
      return <CreditCard {...iconProps} />;
  }
};

export const PaymentOption = memo<PaymentOptionProps>(
  ({ id, label, description, isSelected, disabled = false, onSelect }) => {
    const handleChange = useCallback(() => {
      if (!disabled) {
        onSelect(id);
      }
    }, [id, disabled, onSelect]);

    return (
      <label
        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-indigo-600 bg-indigo-50/50'
            : disabled
            ? 'border-slate-100 opacity-50 cursor-not-allowed'
            : 'border-slate-100 hover:border-slate-200'
        }`}
      >
        <input
          type="radio"
          name="payment"
          className="mt-1 accent-indigo-600 h-4 w-4"
          checked={isSelected}
          onChange={handleChange}
          disabled={disabled}
        />
        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
          {getPaymentIcon(id, isSelected)}
        </div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </label>
    );
  },
);

PaymentOption.displayName = 'PaymentOption';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}
