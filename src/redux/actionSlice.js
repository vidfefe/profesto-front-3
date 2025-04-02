import { createSlice } from '@reduxjs/toolkit';


const actionSlice = createSlice({
    name: 'actions',
    initialState: { isUpdateJobOpen: false, isUpdateCompensationOpen: false, isTerminationOpen: false, clearFilterValue: 0 },
    reducers: {
        setUpdateJob(state, { payload }) {
            state.isUpdateJobOpen = payload
        },
        setUpdateCompensation(state, { payload }) {
            state.isUpdateCompensationOpen = payload
        },
        setTermination(state, { payload }) {
            state.isTerminationOpen = payload
        },
        setClearFilterValue(state) {
           
            state.clearFilterValue += 1;
        },
    },
})


export const { setUpdateJob, setUpdateCompensation, setTermination, setClearFilterValue } = actionSlice.actions;


export default actionSlice.reducer;

