import z from 'zod';

export const InfoAccountSchema = z.object({
  avatar: z.string().optional(),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên không được vượt quá 50 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).or(z.string().max(0)).optional(),
});

const newPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  });

const confirmPasswordSchema = z.string().min(1, 'Vui lòng xác nhận mật khẩu mới');

const passwordMatchRefinement = (data: { new_password: string; confirm_password: string }) =>
  data.new_password === data.confirm_password;

export const ChangePasswordSchema = z
  .object({
    password: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    new_password: newPasswordSchema,
    confirm_password: confirmPasswordSchema,
  })
  .refine(passwordMatchRefinement, {
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
    path: ['confirm_password'],
  });

export const ChangePasswordSchemaNoPassword = z
  .object({
    new_password: newPasswordSchema,
    confirm_password: confirmPasswordSchema,
  })
  .refine(passwordMatchRefinement, {
    message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
    path: ['confirm_password'],
  });

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
export type ChangePasswordFormValuesNoPassword = z.infer<typeof ChangePasswordSchemaNoPassword>;

export type InfoAccountFormValues = z.infer<typeof InfoAccountSchema>;
