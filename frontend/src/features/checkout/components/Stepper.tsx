import { Steps } from 'antd';
import { ShoppingBag, CreditCard, CheckCircle2 } from 'lucide-react';
import type { StepState } from '../types/checkout.types';

interface StepperProps {
  currentStep: StepState;
}

export function Stepper({ currentStep }: StepperProps) {
  const currentIndex = currentStep === 'cart' ? 0 : currentStep === 'checkout' ? 1 : 2;

  return (
    <div className="max-w-xl mx-auto pb-8 px-4">
      <Steps
        current={currentIndex}
        items={[
          {
            title: 'Giỏ hàng',
            icon: <ShoppingBag className="w-5 h-5" />,
          },
          {
            title: 'Thanh toán',
            icon: <CreditCard className="w-5 h-5" />,
          },
          {
            title: 'Hoàn tất',
            icon: <CheckCircle2 className="w-5 h-5" />,
          },
        ]}
      />
    </div>
  );
}
