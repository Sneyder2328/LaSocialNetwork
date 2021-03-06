import {AuthApi, ProfileRequest} from "./authApi";
import {setRefreshTokenHeaders} from "../../utils/setAccessTokenHeaders";
import {authActions} from "./authReducer";
import {AppThunk} from "../../store";
import JwtDecode from "jwt-decode";
import {usersActions} from "../User/userReducer";
import {AppState} from "../rootReducer";

const {
    updateProfileSuccess,
    updateProfileRequest,
    updateProfileError,
    logOutRequest,
    signUpRequest,
    logInRequest,
    signUpError,
    logOutSuccess,
    logInError,
    logOutError,
    signInSuccess
} = authActions
const {setUser} = usersActions


const processSignInResponse = ({dispatch, response}: { dispatch: any, response: any }) => {
    if (response.data.access === true && response.data.profile) {
        const accessToken = response.headers['authorization'];
        console.log("accessToken", accessToken);
        const refreshToken = response.headers['authorization-refresh-token'];
        const userId: string = JwtDecode<{ id: string }>(accessToken).id
        dispatch(setUser({user: response.data.profile}))
        dispatch(signInSuccess({userId, accessToken, refreshToken}));
    }
}

export type SignUpCredentials = { username: string; fullname: string; password: string; email: string; };

export const signUpUser = (userData: SignUpCredentials): AppThunk => async (dispatch) => {
    dispatch(signUpRequest())
    try {
        const response = await AuthApi.signUp(userData);
        processSignInResponse({dispatch, response})
    } catch (err) {
        console.log("error:", err);
        const error = err?.response?.data?.error || 'Network connection error'
        const message = err?.response?.data?.message || 'Network connection error'
        dispatch(signUpError({fieldName: error, message}))
    }
};

export type LoginCredentials = { username: string; password: string; };

export const logInUser = (credentials: LoginCredentials): AppThunk => async (dispatch) => {
    dispatch(logInRequest());
    try {
        const response = await AuthApi.logIn(credentials);
        processSignInResponse({dispatch, response})
    } catch (err) {
        console.log("error:", err);
        const error = err?.response?.data?.error || 'Network connection error'
        const message = err?.response?.data?.message || 'Network connection error'
        dispatch(logInError({fieldName: error, message}))
    }
};

export const updateProfile = (user: ProfileRequest): AppThunk => async (dispatch) => {
    console.log('updateProfile user=', user);
    return new Promise<boolean>(async (resolve) => {
        dispatch(updateProfileRequest())
        try {
            const response = await AuthApi.updateProfile(user)
            console.log('updateProfile response', response);
            dispatch(setUser({user: response.data}))
            dispatch(updateProfileSuccess())
            resolve(true)
        } catch (err) {
            console.log('updateProfile err', err);
            dispatch(updateProfileError(err.toString()))
            resolve(false)
        }
    })
}

export const logOutUser = (): AppThunk => async (dispatch: Function, getState: () => AppState) => {
    dispatch(logOutRequest());
    try {
        const {refreshToken} = getState().auth;
        setRefreshTokenHeaders(refreshToken!!);
        await AuthApi.logOut();
        dispatch(logOutSuccess());
    } catch (err) {
        console.log("error logging out", err);
        dispatch(logOutError());
    }
};