import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { IFormSchema, IFieldConfig } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '../../api/client';

interface FormEditorProps {
    initialSchema?: IFormSchema;
    onSave: () => void;
}

const FormEditor: React.FC<FormEditorProps> = ({ initialSchema, onSave }) => {
    const { register, control, handleSubmit, watch } = useForm<IFormSchema>({
        defaultValues: initialSchema || {
            title: '',
            slug: '',
            fields: []
        }
    });

    const { fields, append, remove, move } = useFieldArray({
        control,
        name: "fields"
    });

    const onSubmit = async (data: IFormSchema) => {
        try {
            if (initialSchema?._id) {
                await api.put(`/forms/${initialSchema.slug}`, data);
            } else {
                await api.post('/forms', data);
            }
            onSave();
        } catch (error) {
            console.error(error);
            alert('Failed to save schema');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4">
                <Input label="Form Title" {...register("title", { required: true })} />
                <Input label="Slug (unique ID)" {...register("slug", { required: true })} />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Fields</h3>
                    <Button type="button" size="sm" onClick={() => append({ name: '', label: '', type: 'text' })}>
                        Add Field
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded-md space-y-3 bg-gray-50">
                        <div className="flex justify-between">
                            <span className="font-medium text-gray-500">Field #{index + 1}</span>
                            <button type="button" onClick={() => remove(index)} className="text-red-500 text-sm">Remove</button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <Input label="Name (key)" {...register(`fields.${index}.name` as any, { required: true })} />
                            <Input label="Label" {...register(`fields.${index}.label` as any, { required: true })} />
                            <div className="flex flex-col gap-1">
                                <label className="text-sm">Type</label>
                                <select {...register(`fields.${index}.type` as any)} className="h-10 rounded-md border p-2">
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="password">Password</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" {...register(`fields.${index}.required` as any)} /> Required
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-2">
                <Button typeof="submit">Save Form Schema</Button>
            </div>
        </form>
    );
};

export default FormEditor;
