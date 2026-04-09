import z from "zod";

export const LoginRequestSchema = z.object({
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    password: z.string().min(1, 'Không được để trống mật khẩu.')
});

export const RegisterCustomerRequestSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
    confirm_password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

export const RegisterVendorRequestSchema = z.object({
    name: z.string().min(2).max(50),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
    confirm_password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/), // password must be at least 8 characters, has Uppercase, Lowercase, Number, Special characters, number
    store_name: z.string().min(2).max(100),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

export const InfoAccountSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    phone_number: z
        .string()
        .min(10, "Phone phải >= 10 số")
        .max(11, "Phone <= 11 số")
        .nullable()
        .or(z.literal("")),
    avatar: z.string().nullable().or(z.literal("")),
    gender: z.enum(['male', 'female', 'other']).nullable().or(z.literal("")),
    birthday: z.string().nullable().or(z.literal("")),
})

export const ChangePasswordSchema = (isGoogle: boolean = false) => z.object({
    password: isGoogle ? z.string() : z.string().min(1, 'Không được để trống mật khẩu cũ.'),
    new_password: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự.').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Mật khẩu mới phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'),
    confirm_password: z.string().min(8, 'Xác nhận mật khẩu mới phải có ít nhất 8 ký tự.').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Xác nhận mật khẩu mới phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu mới và xác nhận mật khẩu mới không khớp.",
    path: ["confirm_password"],
});


export const AddressSchema = z.object({
    id: z.number().nullable().or(z.literal(null)),
    name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự.').max(100, 'Tên không được vượt quá 100 ký tự.'),
    phone: z.string().min(10, 'Số diện thoại phải >= 10 số.').max(11, 'Số diện thoại <= 11 số.'),
    address_detail: z.string().min(2, 'Bắt buộc phải nhập địa chỉ chi tiết.'),
    address: z.object({
        province: z.object({
            value: z.string().min(2, 'Bắt buộc phải chọn tỉnh/thành phố.'),
            label: z.string().min(2, 'Bắt buộc phải chọn tỉnh/thành phố.'),
            id: z.string().or(z.literal(null)),
        }).nullable(),
        ward: z.object({
            value: z.string().min(2, 'Bắt buộc phải chọn phường/xã.'),
            label: z.string().min(2, 'Bắt buộc phải chọn phường/xã.'),
            id: z.string().or(z.literal(null)),
        }).nullable(),
    }),
    type: z.enum(['home', 'work']).default('home'),
    is_default: z.boolean(),
});