import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import AsyncStorage from '@react-native-community/async-storage';
import {persistReducer} from "redux-persist";

export interface AuthState {
    accessToken?: string;
    refreshToken?: string;
    // expiresOn
    isAuthenticated: boolean;
    isLoggingIn: boolean;
    isSigningUp: boolean;
    isLoggingOut: boolean;
    userId?: string;
    signUpError?: string;
    logInError?: string;
    isUpdatingProfile? : boolean;
    updateProfileError?: string;
}

const initialAuthState: AuthState = {
    isAuthenticated: false,
    isLoggingIn: false,
    isLoggingOut: false,
    isSigningUp: false
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {
        logInRequest: (state) => {
            state.isLoggingIn = true
            state.logInError = undefined
        },
        logInError: (state, action: PayloadAction<string>) => {
            state.isLoggingIn = false
            state.logInError = action.payload
        },
        signInSuccess: (state, action: PayloadAction<{ userId: string; accessToken: string; refreshToken: string }>) => {
            console.log("reducer userLoggedInSuccess ", state);
            const {userId, accessToken, refreshToken} = action.payload

            state.isLoggingIn = false
            state.isSigningUp = false
            state.isAuthenticated = true
            state.userId = userId
            state.accessToken = accessToken
            state.refreshToken = refreshToken
        },
        refreshAccessTokenSuccess: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
        },
        signUpRequest: (state) => {
            state.isSigningUp = true
            state.signUpError = undefined
        },
        signUpError: (state, action: PayloadAction<string>) => {
            state.signUpError = action.payload
            state.isSigningUp = false
        },
        logOutRequest: (state) => {
            state.isLoggingOut = true
        },
        logOutSuccess: (state) => initialAuthState,
        logOutError: (state) => {
            state.isLoggingOut = false
        },
        updateProfileRequest: (state) => {
            state.isUpdatingProfile = true
        },
        updateProfileSuccess: (state) => {
            state.isUpdatingProfile = false
            state.updateProfileError = undefined
        },
        updateProfileError: (state, action: PayloadAction<string>) => {
            state.isUpdatingProfile = false
            state.updateProfileError = action.payload
        }
    }
})

const persistConfig = {
    key: authSlice.name,
    storage: AsyncStorage,
    blacklist: ['isLoggingIn', 'isSigningUp', 'isLoggingOut', 'logInError', 'signUpError', 'updateProfileError', 'isUpdatingProfile']
};

export const authReducer = persistReducer(persistConfig, authSlice.reducer);
export const authActions = authSlice.actions