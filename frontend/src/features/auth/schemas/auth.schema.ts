import z from "zod";

export const LoginRequestSchema = z.object({
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    password: z.string().min(1, 'Không được để trống mật khẩu.')
});

export const RegisterCustomerRequestSchema = z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.').max(50, 'Tên không được vượt quá 50 ký tự.'),
    email: z.string().email('Email không hợp lệ.'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
    confirm_password: z.string().min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự.').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
}).refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp.",
    path: ["confirm_password"],
});

export const RegisterVendorRequestSchema = z.object({
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.').max(50, 'Tên không được vượt quá 50 ký tự.'),
    email: z.string().email('Email không hợp lệ.'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự.').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
    confirm_password: z.string().min(8, 'Xác nhận mật khẩu phải có ít nhất 8 ký tự.').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
    store_name: z.string().min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự.').max(100, 'Tên cửa hàng không được vượt quá 100 ký tự.'),
}).refine((data) => data.password === data.confirm_password, {
    message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp.",
    path: ["confirm_password"],
});