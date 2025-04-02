import { combineReducers } from '@reduxjs/toolkit'

import auth from './authSlice';
import creationSlice from './creationSlice';
import personSlice from './personSlice';
import actionSlice from './actionSlice';
import errorSlice from './errorSlice';
import companySlice from './companySlice';

const combineSlices = combineReducers({
    auth,
    creationSlice,
    personSlice,
    actionSlice,
    errorSlice,
    companySlice,
});

export default combineSlices;