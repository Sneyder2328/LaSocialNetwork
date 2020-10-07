import {combineReducers} from "@reduxjs/toolkit";

import {authReducer, AuthState} from "./Auth/authReducer";
import {postsReducer, PostState} from "./Post/postsReducer";
import {newsFeedReducer, NewsFeedState} from "./NewsFeed/newsFeedReducer";
import {usersReducer, UsersState} from "./usersReducer";
import {commentsReducer, CommentsState} from "./Comment/commentsReducer";
import {profilesReducer, ProfilesState} from "./Profile/profilesReducer";

export interface MyAppState {
    auth: AuthState;
    entities: {
        posts: PostState;
        newsFeed: NewsFeedState;
        users: UsersState;
        comments: CommentsState;
    },
    profiles: ProfilesState;
}

export const rootReducer = combineReducers({
    auth: authReducer,
    entities: combineReducers({
        posts: postsReducer,
        newsFeed: newsFeedReducer,
        users: usersReducer,
        comments: commentsReducer,
    }),
    profiles: profilesReducer
});