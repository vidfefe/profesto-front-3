import { createSlice } from '@reduxjs/toolkit';

const companySlice = createSlice({
  name: 'company',
  initialState: {
    features: null,
  },
  reducers: {
    setCompanyFeatures: (state, { payload }) => {
      state.features = payload;
    },
  },
});

export const { setCompanyFeatures } = companySlice.actions;

export default companySlice.reducer;
