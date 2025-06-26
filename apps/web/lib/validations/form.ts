import * as yup from 'yup';
import {
  sanitizeText,
  validateInputLength,
  VALIDATION_PATTERNS,
} from '@/utils/security';

// Custom sanitization transformer
const sanitizeTransformer = (value: string) => {
  if (!value) return value;
  return sanitizeText(value);
};

// Custom length validation
const validateLength = (min: number, max: number) => {
  return (value: string | undefined) => {
    if (!value) return true;
    return validateInputLength(value, min, max);
  };
};

export const formSchema = yup.object().shape({
  name: yup
    .string()
    .required('Form name is required')
    .transform(sanitizeTransformer)
    .test(
      'length',
      'Form name must be between 3 and 100 characters',
      validateLength(3, 100)
    )
    .test('xss', 'Invalid characters detected', (value) => {
      if (!value) return true;
      return !/<script|javascript:|vbscript:|data:/i.test(value);
    }),

  slug: yup
    .string()
    .required('Form slug is required')
    .transform(sanitizeTransformer)
    .matches(
      VALIDATION_PATTERNS.SLUG,
      'Slug can only contain lowercase letters, numbers and hyphens'
    )
    .test(
      'length',
      'Slug must be between 3 and 50 characters',
      validateLength(3, 50)
    ),

  description: yup
    .string()
    .required('Description is required')
    .transform(sanitizeTransformer)
    .test(
      'length',
      'Description must be between 10 and 500 characters',
      validateLength(10, 500)
    )
    .test('xss', 'Invalid characters detected', (value) => {
      if (!value) return true;
      return !/<script|javascript:|vbscript:|data:/i.test(value);
    }),

  type: yup
    .string()
    .required('Form type is required')
    .transform(sanitizeTransformer)
    .test(
      'length',
      'Type must be between 2 and 50 characters',
      validateLength(2, 50)
    ),

  fileUrl: yup
    .string()
    .nullable()
    .transform((value) => {
      if (value === '' || value === null) return undefined;
      // Sanitize URL if provided
      if (value) {
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:'
            ? value
            : undefined;
        } catch {
          return undefined;
        }
      }
      return value;
    })
    .optional(),

  isActive: yup.boolean().default(false),
  allowEditAfterSubmit: yup.boolean().default(false),
  requireApproval: yup.boolean().default(false),

  data: yup
    .object()
    .shape({
      questions: yup
        .array()
        .of(
          yup.object().shape({
            id: yup
              .number()
              .required()
              .positive('Question ID must be positive'),
            title: yup
              .string()
              .required('Question title is required')
              .transform(sanitizeTransformer)
              .test(
                'length',
                'Question title must be between 5 and 200 characters',
                validateLength(5, 200)
              )
              .test('xss', 'Invalid characters detected', (value) => {
                if (!value) return true;
                return !/<script|javascript:|vbscript:|data:/i.test(value);
              }),
            type: yup
              .string()
              .required('Question type is required')
              .oneOf(
                [
                  'text',
                  'textarea',
                  'number',
                  'email',
                  'tel',
                  'date',
                  'multiple-choice',
                  'checkbox',
                  'select',
                ],
                'Invalid question type'
              ),
            answers: yup
              .array()
              .of(
                yup.object().shape({
                  id: yup
                    .number()
                    .required()
                    .positive('Answer ID must be positive'),
                  type: yup
                    .string()
                    .required('Answer type is required')
                    .oneOf(
                      ['text', 'number', 'boolean'],
                      'Invalid answer type'
                    ),
                  content: yup
                    .string()
                    .required('Answer content is required')
                    .transform(sanitizeTransformer)
                    .test(
                      'length',
                      'Answer content must be between 1 and 500 characters',
                      validateLength(1, 500)
                    )
                    .test('xss', 'Invalid characters detected', (value) => {
                      if (!value) return true;
                      return !/<script|javascript:|vbscript:|data:/i.test(
                        value
                      );
                    }),
                })
              )
              .when('type', {
                is: (val: string) =>
                  ['multiple-choice', 'checkbox', 'select'].includes(val),
                then: (schema) =>
                  schema.min(1, 'At least one answer option is required'),
                otherwise: (schema) => schema,
              }),
          })
        )
        .min(1, 'At least one question is required')
        .max(50, 'Maximum 50 questions allowed')
        .required(),
    })
    .required(),
});

// Enhanced validation for form submissions
export const formSubmissionSchema = yup.object().shape({
  result: yup
    .object()
    .required('Form result is required')
    .test('not-empty', 'Form result cannot be empty', (value) => {
      return value && Object.keys(value).length > 0;
    })
    .test('valid-structure', 'Invalid form result structure', (value) => {
      if (!value || typeof value !== 'object') return false;

      // Validate that all values are objects with proper structure
      return Object.values(value).every(
        (item) => item && typeof item === 'object' && !Array.isArray(item)
      );
    }),

  remarks: yup
    .string()
    .optional()
    .transform(sanitizeTransformer)
    .test('length', 'Remarks must be less than 1000 characters', (value) => {
      if (!value) return true;
      return value.length <= 1000;
    })
    .test('xss', 'Invalid characters detected', (value) => {
      if (!value) return true;
      return !/<script|javascript:|vbscript:|data:/i.test(value);
    }),
});

// Validation for form updates
export const formUpdateSchema = yup.object().shape({
  name: yup
    .string()
    .optional()
    .transform(sanitizeTransformer)
    .test(
      'length',
      'Form name must be between 3 and 100 characters',
      validateLength(3, 100)
    ),

  description: yup
    .string()
    .optional()
    .transform(sanitizeTransformer)
    .test(
      'length',
      'Description must be between 10 and 500 characters',
      validateLength(10, 500)
    ),

  isActive: yup.boolean().optional(),
  allowEditAfterSubmit: yup.boolean().optional(),
  requireApproval: yup.boolean().optional(),
});
