import {transport} from "./lsn";
import {setAccessTokenHeaders} from "../utils/setAccessTokenHeaders";
import {Constants} from "../utils/constants";

export const AuthApi = {
    async signUp(userData: { username: string; fullname: string; password: string; email: string; }) {
        return await transport.post('/users/', {
            username: userData.username,
            fullname: userData.fullname,
            password: userData.password,
            typeLogin: 'email',
            email: userData.email,
            description: '',
            profilePhotoUrl: '',
            coverPhotoUrl: ''
        });
    },
    async logIn({username, password}: { username: string; password: string; }) {
        console.log('logIn', username, password);
        return await transport.post('/sessions/', {username, password});
    },
    // async getNewAccessToken(refreshToken: string) {
    //     const response = await transport.get('/tokens', {headers: {['authorization-refresh-token']: refreshToken}});
    //     // const response = await transport.get('/tokens', {headers: {[`${REFRESH_TOKEN}`]: refreshToken}});
    //     if (response.data.accessTokenIssued === true) {
    //         const accessToken = response.headers['authorization'] as string;
    //         setAccessTokenHeaders(accessToken);
    //         return accessToken
    //     }
    // },
    async logOut() {
        return await transport.delete('/sessions/')
    }
};