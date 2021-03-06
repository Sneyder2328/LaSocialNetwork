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
const UserNotFoundError_1 = require("../../utils/errors/UserNotFoundError");
const sequelize_1 = require("sequelize");
const relationshipService_1 = require("./relationshipService");
const { User, Profile } = database_1.models;
function getProfileByUsername(username, currentUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield Profile.findOne({ where: { username } });
        user.setDataValue('relationship', yield relationshipService_1.getRelationshipType(currentUserId, user.userId));
        if (!user)
            throw new UserNotFoundError_1.UserNotFoundError();
        return user;
    });
}
exports.getProfileByUsername = getProfileByUsername;
function getProfileByUserId(userId, currentUserId, includeRelationship = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield Profile.findByPk(userId);
        if (includeRelationship)
            user.setDataValue('relationship', yield relationshipService_1.getRelationshipType(currentUserId, userId));
        if (!user)
            throw new UserNotFoundError_1.UserNotFoundError();
        return user;
    });
}
exports.getProfileByUserId = getProfileByUserId;
function getUserIdFromUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield Profile.findOne({ where: { username } });
        if (!user)
            throw new UserNotFoundError_1.UserNotFoundError();
        return user.userId;
    });
}
exports.getUserIdFromUsername = getUserIdFromUsername;
function updateProfile(userId, { username, fullname, description }, imageFiles) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        const profilePhotoUrl = (_c = (_b = (_a = imageFiles) === null || _a === void 0 ? void 0 : _a.imageProfile) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.url;
        const coverPhotoUrl = (_f = (_e = (_d = imageFiles) === null || _d === void 0 ? void 0 : _d.imageCover) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.url;
        if (profilePhotoUrl && coverPhotoUrl) {
            yield Profile.update({ username, fullname, description, profilePhotoUrl, coverPhotoUrl }, { where: { userId } });
        }
        else if (profilePhotoUrl) {
            yield Profile.update({ username, fullname, description, profilePhotoUrl }, { where: { userId } });
        }
        else if (coverPhotoUrl) {
            yield Profile.update({ username, fullname, description, coverPhotoUrl }, { where: { userId } });
        }
        else {
            // console.log('updating only', username, fullname, description);
            yield Profile.update({ username, fullname, description }, { where: { userId } });
        }
        // @ts-ignore
        yield User.update({ username }, { where: { id: userId } });
        return yield Profile.findByPk(userId);
    });
}
exports.updateProfile = updateProfile;
/**
 * Search users given the query matches the beginning of the full name
 * @param query (aka full name of the user looked for)
 */
function searchUser(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return Profile.findAll({
            attributes: ['userId', 'username', 'fullname', 'profilePhotoUrl'],
            where: {
                fullname: {
                    [sequelize_1.Op.like]: `${query}%`
                }
            }
        });
    });
}
exports.searchUser = searchUser;
/**
 * Get photos by a userId given its posts images
 * @param userId
 */
function getPhotos(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return database_1.sequelize.query(`
SELECT post_image.id, url
FROM post_image
         JOIN post p on post_image.postId = p.id
WHERE p.userId = '${userId}'`, {
            // @ts-ignore
            type: database_1.sequelize.QueryTypes.SELECT
        });
    });
}
exports.getPhotos = getPhotos;
