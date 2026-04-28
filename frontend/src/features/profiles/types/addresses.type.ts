export interface AddressItem {
    id?: number;
    name: string;
    phone: string;
    address_detail: string;
    city: string;
    ward: string;
    is_default: boolean;
    type: 'home' | 'work';
}