"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const errorHandler_1 = __importDefault(require("../middlewares/errorHandler"));
const undefRoutesHandler_1 = __importDefault(require("../middlewares/undefRoutesHandler"));
const user_1 = __importDefault(require("./user/user"));
const post_1 = __importDefault(require("./post/post"));
const auth_1 = __importDefault(require("./auth/auth"));
const comment_1 = __importDefault(require("./comment/comment"));
const messages_1 = require("./message/messages");
const notification_1 = require("./notification/notification");
const router = express_1.Router();
router.use('/', user_1.default);
router.use('/', post_1.default);
router.use('/', auth_1.default);
router.use('/', comment_1.default);
router.use('/', messages_1.messagesRouter);
router.use('/', notification_1.notificationsRouter);
router.use('*', undefRoutesHandler_1.default);
router.use(errorHandler_1.default);
exports.default = router;
