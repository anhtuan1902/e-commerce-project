const convertAddress = (address_detail: string, ward: string, city: string) => {
    return `${address_detail}, ${ward}, ${city}`;
};

export default convertAddress;