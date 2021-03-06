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
const postService_1 = require("./postService");
const authenticate_1 = __importDefault(require("../../middlewares/authenticate"));
const validate_1 = require("../../middlewares/validate");
const handleErrorAsync_1 = require("../../middlewares/handleErrorAsync");
const httpResponseCodes_1 = __importDefault(require("../../utils/constants/httpResponseCodes"));
const endpoints_1 = __importDefault(require("../../utils/constants/endpoints"));
const multer_1 = __importDefault(require("multer"));
const cloudinaryConfig_1 = require("../../config/cloudinaryConfig");
const multer_storage_cloudinary_1 = __importDefault(require("multer-storage-cloudinary"));
const AppError_1 = require("../../utils/errors/AppError");
const constants_1 = require("../../utils/constants");
const storage = multer_storage_cloudinary_1.default({
    cloudinary: cloudinaryConfig_1.cloudinary,
    folder: 'postImages',
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
const multerUploads = parser.array('image', constants_1.MAX_IMGS_PER_UPLOAD);
const router = express_1.Router();
router.post(endpoints_1.default.post.CREATE_POST, authenticate_1.default, validate_1.createPostValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = req.body;
    const post = yield postService_1.createPost(content.id, req.userId, content.type, content.text);
    res.status(httpResponseCodes_1.default.CREATED).send(post);
})));
router.post('/imageposts', authenticate_1.default, multerUploads, validate_1.createPostValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const content = req.body;
    if (!req.files)
        throw new AppError_1.AppError(httpResponseCodes_1.default.BAD_REQUEST, 'Image not provided error', 'Image was not successfully uploaded');
    const imageUrls = req.files.map(file => file.url);
    const post = yield postService_1.createPost(content.id, req.userId, content.type, content.text, imageUrls);
    res.status(httpResponseCodes_1.default.CREATED).send(post);
})));
router.get(endpoints_1.default.post.GET_POSTS, authenticate_1.default, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield postService_1.getPosts(req.userId);
    res.status(httpResponseCodes_1.default.OK).send(posts);
})));
router.post(endpoints_1.default.post.LIKE_POST(':postId'), authenticate_1.default, validate_1.likePostValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield postService_1.likePost(req.userId, req.params.postId);
    res.status(httpResponseCodes_1.default.OK).send(response);
})));
router.delete(endpoints_1.default.post.LIKE_POST(':postId'), authenticate_1.default, validate_1.likePostValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield postService_1.removeLikeOrDislikeFromPost(req.userId, req.params.postId);
    res.status(httpResponseCodes_1.default.OK).send(response);
})));
router.post(endpoints_1.default.post.DISLIKE_POST(':postId'), authenticate_1.default, validate_1.likePostValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield postService_1.dislikePost(req.userId, req.params.postId);
    res.status(httpResponseCodes_1.default.OK).send(response);
})));
router.delete(endpoints_1.default.post.DISLIKE_POST(':postId'), authenticate_1.default, validate_1.likePostValidationRules, validate_1.validate, handleErrorAsync_1.handleErrorAsync((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield postService_1.removeLikeOrDislikeFromPost(req.userId, req.params.postId);
    res.status(httpResponseCodes_1.default.OK).send(response);
})));
exports.default = router;
