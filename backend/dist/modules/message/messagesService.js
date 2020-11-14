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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../database/database");
const utils_1 = require("../../utils/utils");
exports.getMessages = (userId, otherUserId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let conversationId = yield database_1.sequelize.query(`SELECT id FROM Conversation 
WHERE (userOneId='${userId}' AND userTwoId='${otherUserId}') 
OR (userOneId='${otherUserId}' AND userTwoId='${userId}') 
LIMIT 1`, {
        // @ts-ignore
        type: database_1.sequelize.QueryTypes.SELECT
    });
    console.log('conversationId=', conversationId);
    conversationId = (_a = conversationId[0]) === null || _a === void 0 ? void 0 : _a.id;
    if (!conversationId) {
        conversationId = utils_1.genUUID();
        const resultInsert = yield database_1.sequelize.query(`INSERT INTO Conversation(id, userOneId, userTwoId) VALUES('${conversationId}', '${userId}', '${otherUserId}')`);
        console.log('resultInsert=', resultInsert);
        return [];
    }
    return database_1.sequelize.query(`SELECT userId, replyTo, content, typeContent, status, createdAt FROM Message WHERE conversationId = '${conversationId}'`, {
        // @ts-ignore
        type: database_1.sequelize.QueryTypes.SELECT
    });
});
exports.getConversations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    //     const conversations: any = await sequelize.query(`SELECT id, userOneId, userTwoId FROM Conversation
    // WHERE userOneId='${userId}' OR userTwoId='${userId}'`, {
    //         // @ts-ignore
    //         type: sequelize.QueryTypes.SELECT
    //     })
    const conversations = yield database_1.sequelize.query(`SELECT C.userTwoId as interlocutorId, C.id as conversationId, 
P.username as username, P.fullname as fullname, P.description as description,
P.coverPhotoUrl as coverPhotoUrl, P.profilePhotoUrl as profilePhotoUrl, P.userId as userId
FROM Conversation C JOIN Profile P ON P.userId=C.userTwoId
WHERE userOneId='${userId}'`, {
        // @ts-ignore
        type: database_1.sequelize.QueryTypes.SELECT
    });
    return conversations.map(({ interlocutorId, conversationId, username, fullname, description, coverPhotoUrl, profilePhotoUrl, userId }) => {
        return {
            conversationId,
            interlocutorId,
            authorProfile: {
                userId, username, fullname, description, coverPhotoUrl, profilePhotoUrl
            }
        };
    });
    // return conversations.map(({id, userOneId, userTwoId}) => {
    //     return {
    //         conversationId: id,
    //         interlocutorId: userId === userOneId ? userTwoId : userOneId
    //     }
    // })
});
