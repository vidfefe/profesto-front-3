import { configureStore } from '@reduxjs/toolkit'
import slices from './combine'

const store = configureStore({
    reducer: slices,
    devTools: process.env.NODE_ENV === 'development'
})

export default store