import { createSlice } from '@reduxjs/toolkit';


// export const userStoringAction = (user) => async (dispatch) => {
//     dispatch(storeUser(processObjectForStorage(user)));
// }


const authSlice = createSlice({
    name: 'auth',
    initialState: { isLoading: false, error: '', token: '', refreshToken: '', domain: '', currentUser: null },
    reducers: {
        setLoading(state, { payload }) {
            state.isLoading = payload
        },
        setError(state, { payload }) {
            state.error = payload
        },
        setToken(state, { payload }) {
            state.token = payload
        },
        setRefreshToken(state, { payload }) {
            state.refreshToken = payload
        },
        setDomain(state, { payload }) {
            state.domain = payload
        },
        setCurrentUser(state, { payload }) {
            state.currentUser = payload
        }
    },
})



export const { setLoading, setError, setToken, setDomain, setCurrentUser } = authSlice.actions;


export default authSlice.reducer;

