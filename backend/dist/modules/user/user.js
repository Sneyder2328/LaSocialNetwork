"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userService_1 = require("./userService");
const validate_1 = require("../../middlewares/validate");
const handleErrorAsync_1 = require("../../middlewares/handleErrorAsync");
const authenticate_1 = __importDefault(require("../../middlewares/authenticate"));
const endpoints_1 = __importDefault(require("../../utils/constants/endpoints"));
const httpResponseCodes_1 = __importDefault(require("../../utils/constants/httpResponseCodes"));
const multer_1 = __importDefault(require("multer"));
const constants_1 = require("../../utils/constants");
const cloudinaryConfig_1 = require("../../config/cloudinaryConfig");
const multer_storage_cloudinary_1 = __importDefault(require("multer-storage-cloudinary"));
const relationshipService_1 = require("./relationshipService");
const verifyParamId_1 = require("../../middlewares/verifyParamId");
const utils_1 = require("../../utils/utils");
const storage = multer_storage_cloudinary_1.default({
    cloudinary: cloudinaryConfig_1.cloudinary,
    folder: 'usersImages',
    allowedFormats: ['jpg', 'png', "jpeg"],
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    },
    transformation: [{ width: 960, height: 960, crop: 'limit' }]
});
const parser = multer_1.default({
    storage,
    limits: { fileSize: constants_1.MAX_IMG_FILE_SIZE }
});
const imageUpload = parser.fields([
    { name: 'imageProfile', maxCount: 1 },
    { name: 'imageCover', maxCount: 1 }
]);
const router = express_1.Router();
/**
 * Get user's profile basic data
 */
router.get(endpoints_1.default.user.USERS(':userIdentifier'), authenticate_1.default, validate_1.getProfileValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIdentifier = req.params.userIdentifier;
    const user = utils_1.isUUIDV4(userIdentifier) ? yield userService_1.getProfileByUserId(userIdentifier, req.userId) : yield userService_1.getProfileByUsername(userIdentifier, req.userId);
    res.json(user);
})));
/**
 * Get userId given an username
 */
router.get(`/users/:username/id`, authenticate_1.default, validate_1.getIdFromUserValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username;
    const userId = yield userService_1.getUserIdFromUsername(username);
    res.json({ userId });
})));
/**
 * Update current logged in user's profile basic data
 */
router.put(endpoints_1.default.user.UPDATE_PROFILE(':userId'), authenticate_1.default, verifyParamId_1.verifyParamIdMatchesLoggedUser('userId'), imageUpload, validate_1.updateProfileValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userService_1.updateProfile(req.userId, req.body, req.files);
    res.json(user);
})));
/**
 * Search for users whose full name matches a given query
 */
router.get(endpoints_1.default.user.SEARCH, authenticate_1.default, validate_1.searchUserValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query.query;
    if (query.length < 2)
        return res.send([]);
    const users = yield userService_1.searchUser(query);
    res.json(users);
})));
/**
 * Send a friend request to another user (receiverId)
 */
router.post(endpoints_1.default.user.FRIENDS(':receiverId'), authenticate_1.default, validate_1.sendFriendRequestValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fRequestSent = yield relationshipService_1.sendFriendRequest(req.userId, req.params.receiverId);
    res.status(httpResponseCodes_1.default.CREATED).send(fRequestSent);
})));
/**
 * Respond to friend request received from another user (senderId)
 */
router.put(endpoints_1.default.user.RESPOND_TO_FRIEND_REQUEST(':senderId'), authenticate_1.default, validate_1.acceptFriendRequestValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield relationshipService_1.handleFriendRequest(req.userId, req.params.senderId, req.query.action);
    res.json(response);
})));
/**
 * Remove a friendship(either pending or current) with another user
 */
router.delete(endpoints_1.default.user.FRIENDS(':otherUserId'), authenticate_1.default, validate_1.deleteFriendshipValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield relationshipService_1.deleteFriendship(req.userId, req.params.otherUserId);
    res.status(httpResponseCodes_1.default.OK).send(deleted);
})));
/**
 * Get all friend requests received by current logged in user
 */
router.get(endpoints_1.default.user.GET_FRIEND_REQUESTS, authenticate_1.default, validate_1.getFriendRequestValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const friendRequests = yield relationshipService_1.getFriendRequests(req.userId);
    res.json(friendRequests);
})));
/**
 * Get all current friends of a given user
 */
router.get(endpoints_1.default.USERS_USER_ID_FRIENDS(':userId'), authenticate_1.default, validate_1.getFriendsByUserValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const friends = yield relationshipService_1.getCurrentFriends(req.params.userId);
    res.json(friends);
})));
/**
 * Get active users suggestions of the user
 */
router.get('/suggestions/:userId', authenticate_1.default, validate_1.paramUserIdValidationRules, validate_1.validate, verifyParamId_1.verifyParamIdMatchesLoggedUser('userId'), handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersSuggestions = yield relationshipService_1.getUserSuggestions(req.userId);
    res.json(usersSuggestions);
})));
/**
 * Delete an user suggestion from the logged user's suggestions
 */
router.delete('/suggestions/:suggestedUserId', authenticate_1.default, validate_1.removeUserSuggestionValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updated = yield relationshipService_1.removeUserSuggestion(req.userId, req.params.suggestedUserId);
    res.status(httpResponseCodes_1.default.OK).send(updated);
})));
/**
 * Get photos from an user given his posts
 */
router.get('/users/:userId/photos', authenticate_1.default, validate_1.paramUserIdValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const photos = yield userService_1.getPhotos(req.params.userId);
    res.json(photos);
})));
exports.default = router;
