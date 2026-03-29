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

    address: z
        .string()
        .min(5, "Address >= 5 ký tự")
        .max(255)
        .nullable()
        .or(z.literal("")),
})