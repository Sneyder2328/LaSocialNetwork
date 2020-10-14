"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    auth: {
        LOG_IN: '/sessions',
        LOG_OUT: '/sessions',
        REFRESH_TOKEN: '/tokens'
    },
    user: {
        SIGN_UP: '/users',
        GET_PROFILE: (userIdentifier) => `/users/${userIdentifier}`,
        UPDATE_PROFILE: (userId) => `/users/${userId}`,
        SEND_FRIEND_REQUEST: (receiverUserId) => `/users/${receiverUserId}/friends`,
        GET_FRIEND_REQUESTS: '/me/friends/incoming',
        RESPOND_TO_FRIEND_REQUEST: (senderUserId) => `/users/${senderUserId}/friends`,
        SEARCH: '/users'
    },
    post: {
        CREATE_POST: '/posts',
        GET_POSTS: '/posts',
        LIKE_POST: (postId) => `/posts/${postId}/likes`,
        DISLIKE_POST: (postId) => `/posts/${postId}/dislikes`
    },
    comment: {
        CREATE_COMMENT: (postId) => `/posts/${postId}/comments`,
        LIKE_COMMENT: (commentId) => `/comments/${commentId}/likes`,
        DISLIKE_COMMENT: (commentId) => `/comments/${commentId}/dislikes`,
        GET_COMMENTS: (postId) => `/posts/${postId}/comments`
    }
};
