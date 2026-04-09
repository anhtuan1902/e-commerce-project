export const convertMessageError = (error: any) => {
    if (typeof error === 'string') {
        return error;
    }
    const messageError = error?.map((e: any) => e.message).join(', ') || 'Đã có lỗi xảy ra';
    return messageError;
}