import React, { useMemo } from 'react';
import { Formik, Form } from 'formik';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { IFormSchema } from '../../types/schema.types';
import { FieldRenderer } from './FieldRenderer';
import { Button } from '../ui/Button';
import { generateZodSchema, prepareFormValues } from '../../utils/schemaGenerator';

interface DynamicFormProps {
    schema: IFormSchema;
    onSubmit: (data: any) => void;
    isLoading?: boolean;
    defaultValues?: any;
    submitLabel?: string;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
    schema,
    onSubmit,
    isLoading,
    defaultValues,
    submitLabel = 'Submit'
}) => {
    // Dynamically generate the Zod schema based on the current form schema
    const validationSchema = useMemo(() => {
        const zodSchema = generateZodSchema(schema);
        return toFormikValidationSchema(zodSchema);
    }, [schema]);

    // Create initial values from schema fields to avoid "undefined" passing to Zod
    const initialValues: Record<string, any> = useMemo(() => {
        const values: Record<string, any> = {};
        schema.fields.forEach((field) => {
            if (defaultValues && defaultValues[field.name] !== undefined) {
                values[field.name] = defaultValues[field.name];
            } else if (field.defaultValue !== undefined) {
                values[field.name] = field.defaultValue;
            } else if (field.type === 'number') {
                values[field.name] = ''; // Keep as empty string for input control
            } else if (field.type === 'checkbox') {
                values[field.name] = false;
            } else {
                values[field.name] = '';
            }
        });
        return values;
    }, [schema, defaultValues]);

    const handleSubmit = (values: any) => {
        // Prepare values (convert types as needed)
        const preparedValues = prepareFormValues(values, schema);
        onSubmit(preparedValues);
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
            validateOnChange={true}
            validateOnBlur={true}
            validateOnMount={false}
        >
            {({ isSubmitting: formikIsSubmitting }) => (
                <Form className="flex flex-col gap-4">
                    {schema.title && (
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                            {schema.title}
                        </h2>
                    )}

                    {schema.fields.map((field) => (
                        <FieldRenderer
                            key={field.name}
                            field={field}
                        />
                    ))}

                    <Button
                        type="submit"
                        isLoading={isLoading || formikIsSubmitting}
                        fullWidth
                        size="lg"
                        className="mt-6"
                    >
                        {submitLabel}
                    </Button>
                </Form>
            )}
        </Formik>
    );
};
