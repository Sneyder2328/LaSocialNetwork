import React, {useState} from "react";
import './styles.scss'
// @ts-ignore
import uuidv4 from "uuid/v4";
import {TextEditor} from "../commons/TextEditor";
import {CommentRequest} from "../Comment/commentApi";
import {createComment, loadPreviousComments} from "../Comment/commentActions";
import Comment from "../Comment/Comment"
import {connect} from "react-redux";
import classNames from "classnames";
import {AppState} from "../../reducers";
import {useTimeSincePublished} from "../../hooks/updateRelativeTimeHook";
import {dislikePost, likePost} from "./postActions";

export interface Profile {
    userId: string;
    coverPhotoUrl: string;
    profilePhotoUrl: string;
    description: string;
    fullname: string;
    username: string;
}

export interface Post {
    text: string;
    type: string;
    img: string;
}


export interface PostResponse extends Post {
    id: string;
    userId: string;
    likesCount: number;
    dislikesCount: number;
    commentsCount: number;
    createdAt: any;
    likeStatus: 'like' | 'dislike' | undefined;
    authorProfile: Profile;
    comments: Array<string>;
    loadingPreviousComments?: boolean;
    isCreatingComment?: boolean;
}

type Props = {
    postId: string;
    postResponse: PostResponse;
    createComment: (commentData: CommentRequest) => any;
    loadPreviousComments: (postId: string, offset: number, limit: number) => any;
    likePost: (postId: string, undo: boolean) => any;
    dislikePost: (postId: string, undo: boolean) => any;
};

const Post: React.FC<Props> = ({postResponse, createComment, loadPreviousComments, likePost, dislikePost}) => {
    const timeSincePublished = useTimeSincePublished(postResponse.createdAt);
    const [commentText, setCommentText] = useState<string>('');
    const [focusInput, setFocusInput] = useState<boolean>(false);

    const submitComment = () => {
        if (commentText.trim() !== '') {
            const newComment: CommentRequest = {
                id: uuidv4(),
                img: '',
                text: commentText,
                postId: postResponse.id,
                type: 'text'
            };
            createComment(newComment)
        }
    };

    const loadMoreComments = () => {
        console.log('load comments for post ', postResponse.id, postResponse.comments.length);
        loadPreviousComments(postResponse.id, postResponse.comments.length, 10);
    };

    const shouldFocusTextEditor = () => {
        if (focusInput) {
            setFocusInput(false);
            return true;
        }
        return false;
    };

    return (
        <div className='post'>
            <div className='userProfile'>
                <img className='avatar'
                     src={postResponse.authorProfile.profilePhotoUrl || 'https://miro.medium.com/max/280/1*MccriYX-ciBniUzRKAUsAw.png'}
                     alt='post pic'/>
                <div>
                    <p className='fullname'>{postResponse.authorProfile.fullname}</p>
                    <p className='username'>@{postResponse.authorProfile.username}</p>
                    <p className='time-published'>{timeSincePublished}</p>
                </div>
            </div>
            <p className='content'>{postResponse.text}</p>
            <div className='interact'>
                <span onClick={() => likePost(postResponse.id, postResponse.likeStatus === 'like')}
                      className={classNames({'selected': postResponse.likeStatus === 'like'})}>
                    <i className="fas fa-thumbs-up"/>{postResponse.likesCount !== 0 && postResponse.likesCount}
                </span>
                <span onClick={() => dislikePost(postResponse.id, postResponse.likeStatus === 'dislike')}
                      className={classNames({'selected': postResponse.likeStatus === 'dislike'})}>
                    <i className="fas fa-thumbs-down"/>{postResponse.dislikesCount !== 0 && postResponse.dislikesCount}
                </span>
                <span onClick={() => setFocusInput(true)}>
                    <i className="fas fa-comment"/>
                </span>
                <span>
                    <i className="fas fa-share"/>
                </span>
            </div>
            <div
                className={classNames('load-previous-comments', {'hide': postResponse.commentsCount === postResponse.comments.length})}>
                <span onClick={loadMoreComments}>
                    <i className="showMoreComments fas fa-angle-up"/>
                    Load more comments
                    <i className={classNames('loadingComments fas fa-spinner fa-pulse', {'hide': !postResponse.loadingPreviousComments})}/>
                </span>
            </div>
            <div className={classNames('comments-container', {'hide': postResponse.comments.length === 0})}>
                {postResponse.comments.map(id => (<Comment key={id} commentId={id}/>))}
            </div>
            <div className='new-comment'>
                <img className='avatar'
                     src={postResponse.authorProfile.profilePhotoUrl || 'https://miro.medium.com/max/280/1*MccriYX-ciBniUzRKAUsAw.png'}
                     alt='post pic'/>
                <div className='comment-editor-container'>
                    <TextEditor focusWhen={shouldFocusTextEditor} onChange={setCommentText}
                                placeholder='Write a comment'
                                className='comment-editor'
                                onEnter={submitComment} onEnterCleanUp={true}/>
                </div>

            </div>
        </div>
    );
};
const mapStateToProps = (state: AppState, ownProps: { postId: string }): { postResponse: PostResponse } => {
    let postObject = state.entities.posts.entities[ownProps.postId];
    return {
        postResponse: {
            ...postObject,
            authorProfile: state.entities.users.entities[postObject.userId],
            loadingPreviousComments: state.entities.posts.metas[postObject.id] && state.entities.posts.metas[postObject.id].isLoadingPreviousComments
        }
    }
};
export default connect(mapStateToProps, {createComment, loadPreviousComments, likePost, dislikePost})(Post);