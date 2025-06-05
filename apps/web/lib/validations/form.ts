import * as yup from 'yup';

export const formSchema = yup.object().shape({
  name: yup.string().required('Form name is required'),
  slug: yup.string().required('Form slug is required'),
  description: yup.string().required('Description is required'),
  type: yup.string().required('Form type is required'),
  fileUrl: yup
    .string()
    .nullable()
    .transform((value) => (value === '' || value === null ? undefined : value))
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
            id: yup.number().required(),
            title: yup.string().required('Question title is required'),
            type: yup.string().required('Question type is required'),
            answers: yup
              .array()
              .of(
                yup.object().shape({
                  id: yup.number().required(),
                  type: yup.string().required(),
                  content: yup.string().required('Answer content is required'),
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
        .required(),
    })
    .required(),
});
