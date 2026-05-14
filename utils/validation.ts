import * as yup from 'yup';

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

export const signupSchema = yup.object().shape({
    email: yup
        .string()
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    organizationName: yup.string().when('$isNGO', {
        is: true,
        then: schema => schema.required('Organization name is required'),
        otherwise: schema => schema,
    }),
    regNumber: yup.string().when('$isNGO', {
        is: true,
        then: schema => schema.required('Registration number is required'),
        otherwise: schema => schema,
    }),
    country: yup.string().when('$isNGO', {
        is: true,
        then: schema => schema.required('Country is required'),
        otherwise: schema => schema,
    }),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type SignupFormData = yup.InferType<typeof signupSchema>;
