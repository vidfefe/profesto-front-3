import { createSlice } from '@reduxjs/toolkit';

const creationSlice = createSlice({
    name: 'personCreation',
    initialState: { newDepartment: '', newDivision: '', newLocation: '', newJobTitle: '', newEmploymentStatus: '', newPaymentType: '', newPaymentSchedule: '' },
    reducers: {
        setNewDepartment(state, { payload }) {
            state.newDepartment = payload
        },
        setNewDivision(state, { payload }) {
            state.newDivision = payload
        },
        setNewLocation(state, { payload }) {
            state.newLocation = payload
        },
        setNewJobTitle(state, { payload }) {
            state.newJobTitle = payload
        },
        setNewEmploymentStatus(state, { payload }) {
            state.newEmploymentStatus = payload
        },
        setNewPaymentType(state, { payload }) {
            state.newPaymentType = payload
        },
        setNewPaymentSchedule(state, { payload }) {
            state.newPaymentSchedule = payload
        },
    },
})


export const { setNewDepartment, setNewDivision, setNewLocation, setNewJobTitle, setNewEmploymentStatus, setNewPaymentType, setNewPaymentSchedule  } = creationSlice.actions;


export default creationSlice.reducer;

