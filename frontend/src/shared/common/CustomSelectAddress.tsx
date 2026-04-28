import { useEffect, useMemo, useState } from 'react';
import { Select, Tabs, Typography } from 'antd';
import { v3 } from 'vietnam-divisions-js';

type AddressOption = {
  value: string | null;
  label: string | null;
  id: string | null;
};

export type AddressValue = {
  province: AddressOption | null;
  ward: AddressOption | null;
};

type Props = {
  value?: AddressValue;
  onChange?: (value: AddressValue) => void;
  error?: { message: string };
};

const CustomSelectAddress = ({ value, onChange, error, ...props }: Props) => {
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [activeTab, setActiveTab] = useState<'province' | 'ward'>('province');
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);

  // fallback internal state nếu không truyền từ ngoài
  const [internalValue, setInternalValue] = useState<AddressValue>({
    province: null,
    ward: null,
  });

  const selected = value ?? internalValue;

  const triggerChange = (val: AddressValue) => {
    if (!value) setInternalValue(val);
    onChange?.(val);
  };

  // Fetch provinces
  useEffect(() => {
    (async () => {
      const result = await v3.getAllProvinces();
      const mapped = (result as any[]).map((p) => ({
        value: p.name,
        label: p.name,
        id: String(p.idProvince ?? p.id),
      }));
      setProvinces(mapped);
    })();
  }, []);

  // Fetch wards theo province
  useEffect(() => {
    if (!selected.province) return;
    (async () => {
      const result = selected?.province?.id
        ? await v3.getCommunesByProvinceId(selected.province.id)
        : [];
      const mapped = (result as any[]).map((w) => ({
        value: w.name,
        label: w.name,
        id: String(w.idCommune ?? w.id),
      }));
      setWards(mapped);
    })();
  }, [selected.province]);

  const tabItems = [
    { key: 'province', label: 'Tỉnh/Thành phố', disabled: false },
    { key: 'ward', label: 'Phường/Xã', disabled: !selected.province },
  ];

  const currentOptions = useMemo(() => {
    const list = { province: provinces, ward: wards }[activeTab];
    if (!searchValue.trim()) return list;
    return list.filter((o) => o.label?.toLowerCase().includes(searchValue.toLowerCase()));
  }, [activeTab, provinces, wards, searchValue]);

  const displayValue = useMemo(() => {
    const parts = [selected.province?.label, selected.ward?.label];
    const filled = parts.filter(Boolean);
    return filled.length > 0 ? filled.join(', ') : undefined;
  }, [selected]);

  const handleSelect = (option: AddressOption) => {
    if (activeTab === 'province') {
      triggerChange({ province: option, ward: null });
      setActiveTab('ward');
      setWards([]);
    } else {
      triggerChange({ ...selected, ward: option });
      setOpen(false);
    }
    setSearchValue('');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'province' | 'ward');
    setSearchValue('');
  };

  const getErrorMessages = (errors: Record<string, any>) => {
    return Object.values(errors)
      .map((err) => err?.value?.message)
      .filter(Boolean);
  };

  return (
    <div className='w-full'>
      <label className='block text-sm font-medium text-gray-700 mb-2'>Chọn địa chỉ</label>
      <Select
        open={open}
        onOpenChange={(visible) => setOpen(visible)}
        value={displayValue}
        placeholder='Chọn Tỉnh/Thành phố, Phường/Xã'
        className={`w-full pr-4 py-3 border rounded-xl focus:ring-2 focus:outline-none
                  ${error && Object.keys(error).length > 0 ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#1E3A8A]'}
                  disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                `}
        style={{ height: '48px', borderRadius: '12px' }}
        {...props}
        popupRender={() => (
          <div className='p-3 bg-white rounded-lg shadow-sm border border-gray-200'>
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              items={tabItems.map((tab) => ({
                key: tab.key,
                label: tab.label,
                children: null,
                disabled: tab.disabled,
              }))}
            />

            <input
              type='text'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Tìm kiếm...'
              className='w-full px-3 py-2 mb-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300'
            />

            <div className='space-y-1 max-h-56 overflow-y-auto'>
              {currentOptions.length > 0 ? (
                currentOptions.map((option) => {
                  const isSelected = selected[activeTab as keyof AddressValue]?.id === option.id;

                  return (
                    <button
                      key={option.id}
                      type='button'
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-slate-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })
              ) : (
                <div className='px-3 py-4 text-sm text-gray-500 text-center'>
                  Không có kết quả phù hợp.
                </div>
              )}
            </div>
          </div>
        )}
        options={[]}
        allowClear
        onClear={() => {
          triggerChange({ province: null, ward: null });
          setActiveTab('province');
          setSearchValue('');
          setWards([]);
        }}
      />
      {error && <p className='text-sm text-red-500 mt-1'>{getErrorMessages(error).join(' ')}</p>}
    </div>
  );
};

export default CustomSelectAddress;
