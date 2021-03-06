import endpoints from "../../utils/constants/endpoints";
import httpCodes from "../../utils/constants/httpResponseCodes";
import {handleErrorAsync} from "../../middlewares/handleErrorAsync";
import {
    createCommentValidationRules,
    getCommentsValidationRules,
    likeCommentValidationRules, validate
} from "../../middlewares/validate";
import authenticate from "../../middlewares/authenticate";
import {createComment, dislikeComment, getComments, likeComment, removeLikeOrDislikeComment} from "./commentService";
import {Router} from "express";

const router = Router();

/**
 * Create a new comment in a given post
 */
router.post(endpoints.comment.CREATE_COMMENT(':postId'), authenticate, createCommentValidationRules, validate, handleErrorAsync(async (req, res) => {
    const response = await createComment(req.userId, req.params.postId, req.body);
    res.status(httpCodes.CREATED).send(response);
}));

/**
 * Add a like interaction to a comment
 */
router.post(endpoints.comment.LIKE_COMMENT(':commentId'), authenticate, likeCommentValidationRules, validate, handleErrorAsync(async (req, res) => {
    const response = await likeComment(req.userId, req.params.commentId);
    res.status(httpCodes.OK).send(response);
}));

/**
 * Remove a like interaction to a comment
 */
router.delete(endpoints.comment.LIKE_COMMENT(':commentId'), authenticate, likeCommentValidationRules, validate, handleErrorAsync(async (req, res) => {
    const response = await removeLikeOrDislikeComment(req.userId, req.params.commentId);
    res.status(httpCodes.OK).send(response);
}));

/**
 * Add a dislike interaction to a comment
 */
router.post(endpoints.comment.DISLIKE_COMMENT(':commentId'), authenticate, likeCommentValidationRules, validate, handleErrorAsync(async (req, res) => {
    const response = await dislikeComment(req.userId, req.params.commentId);
    res.status(httpCodes.OK).send(response);
}));

/**
 * Remove a dislike interaction to a comment
 */
router.delete(endpoints.comment.DISLIKE_COMMENT(':commentId'), authenticate, likeCommentValidationRules, validate, handleErrorAsync(async (req, res) => {
    const response = await removeLikeOrDislikeComment(req.userId, req.params.commentId);
    res.status(httpCodes.OK).send(response);
}));


/**
 * Get all comments by a given post
 */
router.get(endpoints.comment.GET_COMMENTS(':postId'), authenticate, getCommentsValidationRules, validate, handleErrorAsync(async (req, res) => {
    const response = await getComments(req.userId, req.params.postId, req.query.limit, req.query.offset);
    res.status(httpCodes.OK).send(response);
}));

export default router;