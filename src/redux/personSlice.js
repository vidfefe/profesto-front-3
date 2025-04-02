import { createSlice } from '@reduxjs/toolkit';
import { getStorageObject } from '../utils/storage';

const personSlice = createSlice({
    name: 'personSlice',
    initialState: {
        firstName: '',
        lastName: '',
        preferredName: '',
        middleName: '',
        hireDate: '',
        newDepartment: '',
        newDivision: '',
        newLocation: '',
        newJobTitle: '',
        newNationality: '',
        activeTab: 0,
        payrollActiveTab: 0,
        peopleDirPath: getStorageObject('people-path') || 'people',
        jobInfo: '',
        overlayLoading: false,
        person: null
    },
    reducers: {
        setActiveTab(state, { payload }) {
            state.activeTab = payload
        },
        setPayrollActiveTab(state, { payload }) {
            state.payrollActiveTab = payload
        },
        setHireDate(state, { payload }) {
            state.hireDate = payload
        },
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
        setNewNationality(state, { payload }) {
            state.newNationality = payload
        },
        setPeopleDirPath(state, { payload }) {
            state.peopleDirPath = payload
        },
        setJobInfo(state, { payload }) {
            state.jobInfo = payload
        },
        setOverlayLoading(state, { payload }) {
            state.overlayLoading = payload
        },
        setPersonAction(state, { payload }) {
            state.person = payload
        },
    },
})


export const { 
    setNewDepartment, 
    setNewDivision, 
    setNewLocation, 
    setNewJobTitle,
    setNewNationality,
    setHireDate, 
    setActiveTab, 
    setPayrollActiveTab,
    setPeopleDirPath, 
    setJobInfo, 
    setOverlayLoading, 
    setPersonAction
 } = personSlice.actions;


export default personSlice.reducer;

