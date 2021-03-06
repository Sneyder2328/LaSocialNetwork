import { convertToHashTable, HashTable, uniqueValuesArray } from "../../utils/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../rootReducer";
import { createSelector } from "reselect/src";
import { authActions } from "../Auth/authReducer";
import { commentsActions } from "../Comment/commentReducer";
import { Post } from "../../components/Post/Post";


const { loadCommentsSuccess, loadCommentsError, loadCommentsRequest, createCommentError, createCommentRequest, createCommentSuccess } = commentsActions
const { logOutSuccess } = authActions

export type PostImage = {
    url: string;
    id: string;
};

export interface PostObject extends Post {
    id: string;
    userId: string;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    createdAt: any;
    comments: Array<string>;
    images: Array<PostImage>;
    previewImages?: Array<File>;
    likeStatus: 'like' | 'dislike' | undefined;
}

export interface PostMetadata {
    isLoadingPreviousComments?: boolean;
    isCreatingComment?: boolean;
    likeStatus: 'like' | 'dislike' | undefined;
    isUploading: boolean;
}

export type PostState = {
    entities: HashTable<PostObject>;
    metas: HashTable<PostMetadata>;
    postsIdsByPhotoId: HashTable<{
        postId: string;
    }>;
    users: HashTable<{
        ids: Array<string>;
        isLoading: boolean;
        allPostsLoaded: boolean;
        offset?: string;
    }>;
};

const initialState: PostState = {
    entities: {},
    metas: {},
    users: {},
    postsIdsByPhotoId: {}
};

export const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {
        setPosts: (state, action: PayloadAction<HashTable<PostObject>>) => {
            state.entities = {
                ...state.entities,
                ...action.payload
            }
        },
        loadPostRequest: (state) => {

        },
        loadPostSuccess: (state, action: PayloadAction<{ post: HashTable<PostObject> }>) => {
            const postObject = Object.values(action.payload.post)[0];
            state.postsIdsByPhotoId = convertToHashTable(postObject.images.map(({ id }) => ({ postId: postObject.id, id })))
            state.entities = {
                ...state.entities,
                ...action.payload.post
            }
        },
        loadPostError: (state) => {

        },
        loadPostsRequest: (state, action: PayloadAction<{ section: 'top' | 'latest'; }>) => {

        },
        loadPostsSuccess: (state, action: PayloadAction<{
            posts: HashTable<PostObject>;
            section: 'top' | 'latest';
            allIds: Array<string>;
        }>) => {
            state.entities = {
                ...state.entities,
                ...action.payload.posts
            }
        },
        loadPostsError: (state, action: PayloadAction<{ section: 'top' | 'latest'; }>) => {

        },
        loadPostsByUserRequest: (state, action: PayloadAction<{ userId: string }>) => {
            const {userId} = action.payload
            state.users[userId] = {
                ids: uniqueValuesArray(state.users?.[userId]?.ids, []),
                allPostsLoaded: false,
                isLoading: true,
                offset: state.users?.[userId]?.offset
            }
        },
        loadPostsByUserSuccess: (state, action: PayloadAction<{ userId: string; posts: HashTable<PostObject>; postsIds: Array<string> }>) => {
            const {postsIds, posts, userId} = action.payload
            const lastPostId: string|undefined = postsIds.length > 0 ? postsIds[postsIds.length - 1] : undefined
            state.entities = {
                ...state.entities,
                ...posts
            }
            state.users[userId] = {
                ids: uniqueValuesArray(state.users?.[userId]?.ids, postsIds),
                allPostsLoaded: postsIds.length === 0,
                isLoading: false,
                offset: lastPostId ? posts[lastPostId]?.createdAt : undefined
            }
        },
        loadPostsByUserError: (state, action: PayloadAction<{ userId: string }>) => {
            const {userId} = action.payload
            state.users[userId] = {
                ids: uniqueValuesArray(state.users?.[userId]?.ids, []),
                allPostsLoaded: false,
                isLoading: false,
                offset: state.users?.[userId]?.offset
            }
        },
        interactPostRequest: (state, action: PayloadAction<{ postId: string; typeInteraction: string }>) => {
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                likeStatus: (action.payload.typeInteraction === "like" || action.payload.typeInteraction === "dislike") ? action.payload.typeInteraction : undefined
            }
        },
        interactPostSuccess: (state, action: PayloadAction<{
            post: {
                id: string;
                likesCount: number;
                dislikesCount: number;
            };
            typeInteraction: 'like' | 'unlike' | 'dislike' | 'undislike';
        }>) => {
            state.entities[action.payload.post.id] = {
                ...state.entities[action.payload.post.id],
                likeStatus: (action.payload.typeInteraction === "like" || action.payload.typeInteraction === "dislike") ? action.payload.typeInteraction : undefined,
                likesCount: action.payload.post.likesCount,
                dislikesCount: action.payload.post.dislikesCount
            }
        },
        interactPostError: (state, action: PayloadAction<{ postId: string; typeInteraction: string }>) => {
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                likeStatus: undefined
            }
        },
        createPostRequest: (state, action: PayloadAction<{
            postId: string;
            text: string;
            imageFiles: Array<File>;
            userId: string;
        }>) => {
            state.metas[action.payload.postId] = {
                isLoadingPreviousComments: false,
                isCreatingComment: false,
                likeStatus: undefined,
                isUploading: true
            }
            state.entities[action.payload.postId] = {
                likeStatus: undefined,
                likesCount: 0,
                dislikesCount: 0,
                commentsCount: 0,
                comments: [],
                createdAt: new Date().getTime(),
                id: action.payload.postId,
                text: action.payload.text,
                images: [],
                previewImages: action.payload.imageFiles.map((imgFile) => (imgFile)),
                userId: action.payload.userId
            }
        },
        createPostSuccess: (state, action: PayloadAction<{ postCreated: PostObject; }>) => {
            state.entities[action.payload.postCreated.id] = action.payload.postCreated
            state.metas[action.payload.postCreated.id] = {
                ...state.metas[action.payload.postCreated.id],
                isUploading: false
            }
        },
        createPostError: (state, action: PayloadAction<{ error: string }>) => {

        }
    },
    extraReducers: builder => {
        builder.addCase(loadCommentsSuccess, (state, action) => {
            state.entities[action.payload.postId] = {
                ...state.entities[action.payload.postId],
                comments: uniqueValuesArray(action.payload.newCommentsIds, state.entities[action.payload.postId].comments)
            }
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                isLoadingPreviousComments: false
            }
        }).addCase(loadCommentsError, (state, action) => {
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                isLoadingPreviousComments: false
            }
        }).addCase(loadCommentsRequest, (state, action) => {
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                isLoadingPreviousComments: true
            }
        }).addCase(createCommentRequest, (state, action) => {
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                isCreatingComment: true
            }
        }).addCase(createCommentError, (state, action) => {
            state.metas[action.payload.postId] = {
                ...state.metas[action.payload.postId],
                isCreatingComment: false
            }
        }).addCase(createCommentSuccess, (state, action) => {
            state.entities[action.payload.comment.postId] = {
                ...state.entities[action.payload.comment.postId],
                comments: [...state.entities[action.payload.comment.postId].comments, action.payload.comment.id],
                commentsCount: state.entities[action.payload.comment.postId].commentsCount + 1
            }
            state.metas[action.payload.comment.postId] = {
                ...state.metas[action.payload.comment.postId],
                isCreatingComment: false
            }
        }).addCase(logOutSuccess, _ => initialState)
    }
})


export const postsReducer = postsSlice.reducer
export const postActions = postsSlice.actions

const selectPostObject = (state: AppState, postId: string) => {
    return state.posts?.entities?.[postId]
};

const selectCommentAuthorObject = (state: AppState, postId: string) => {
    return state.users?.entities?.[selectPostObject(state, postId)?.userId]
};

const selectPostMetadata = (state: AppState, postId: string) => {
    return state.posts?.metas?.[postId];
};

export const selectPost = () => createSelector([selectPostObject, selectCommentAuthorObject, selectPostMetadata],
    (postObject, authorObject, postMetadata) => {
        return {
            ...postObject,
            authorProfile: authorObject,
            isLoadingPreviousComments: postMetadata && postMetadata.isLoadingPreviousComments,
            isUploading: postMetadata && postMetadata.isUploading
        };
    }
);