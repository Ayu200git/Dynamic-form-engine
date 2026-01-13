import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/client';
import { IFormSchema } from '../../types/schema.types';

interface FormState {
    schemas: Record<string, IFormSchema>; // key is formType
    loading: boolean;
    error: string | null;
}

const initialState: FormState = {
    schemas: {},
    loading: false,
    error: null,
};

export const fetchSchema = createAsyncThunk(
    'form/fetchSchema',
    async (formType: string, { rejectWithValue }) => {
        try {
            const response = await api.get<IFormSchema>(`/forms/${formType}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch schema');
        }
    }
);

export const saveSchema = createAsyncThunk(
    'form/saveSchema',
    async (schema: IFormSchema, { rejectWithValue }) => {
        try {
            // Check if we updating or creating. 
            // My backend has updateSchema (PUT) and createSchema (POST).
            // But createSchema checks if exists. 
            // Ideally frontend should know. For now let's assume Admin always edits existing or creates new.
            // If we have an ID or if we know it exists.
            // Actually, backend updateSchema uses formType.
            // Let's try update first, if 404 then create? Or just use logical flow.
            // For simplicity, let's assume we use UPDATE for everything if the UI loaded it first.
            // But if it's new... 
            // My backend createSchema uses POST /. 
            // My backend updateSchema uses PUT /:formType.

            // Let's rely on the existence of _id to determine if it's an update.
            if (schema._id) {
                const response = await api.put<IFormSchema>(`/forms/${schema.formType}`, schema);
                return response.data;
            } else {
                const response = await api.post<IFormSchema>('/forms', schema);
                return response.data;
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to save schema');
        }
    }
);

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSchema.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSchema.fulfilled, (state, action: PayloadAction<IFormSchema>) => {
                state.loading = false;
                state.schemas[action.payload.formType] = action.payload;
            })
            .addCase(fetchSchema.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(saveSchema.fulfilled, (state, action: PayloadAction<IFormSchema>) => {
                state.loading = false;
                state.schemas[action.payload.formType] = action.payload;
            });
    },
});

export default formSlice.reducer;
