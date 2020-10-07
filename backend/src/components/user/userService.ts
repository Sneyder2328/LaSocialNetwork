import {models} from "../../database/database";
import {UserNotFoundError} from "../../utils/errors/UserNotFoundError";
import userRelationship from "../../utils/constants/userRelationship";
import {Op} from "sequelize";
import {compareByDateAsc} from "../../utils/utils";
import {LIMIT_COMMENTS_PER_POST} from "../../utils/constants";
import {processPosts} from "../post/postService";

const {Post, Profile, UserRelationShip, PostImage, Comment} = models;

const includePostsSorted = [
    {
        model: Post,
        as: 'posts',
        include: [
            {
                model: PostImage,
                as: 'images',
                attributes: ['url']
            },
            {
                model: Comment,
                as: 'comments',
                limit: LIMIT_COMMENTS_PER_POST,
                order: [['createdAt', 'DESC']],
                include: [Profile]
            }
        ]
    }
];

export async function getProfileByUsername(username: string, includePosts: boolean, currentUserId: string) {
    let user;
    if (includePosts) {
        user = await Profile.findOne({where: {username}, include: includePostsSorted});
        user = user.toJSON();
        // user.posts = user.posts.sort(compareByDateAsc);
        user.posts = await processPosts(user.posts, currentUserId)
    } else {
        user = await Profile.findOne({where: {username}});
    }
    if (!user) throw new UserNotFoundError();
    return user;
}

export async function getProfileByUserId(userId, includePosts: boolean, currentUserId: string) {
    let user;
    if (includePosts) {
        user = await Profile.findByPk(userId, {include: includePostsSorted});
        user = user.toJSON();
        // user.posts = user.posts.sort(compareByDateAsc);
        user.posts = await processPosts(user.posts, currentUserId)
    } else {
        user = await Profile.findByPk(userId);
    }
    if (!user) throw new UserNotFoundError();
    return user;
}

export async function updateProfile(userId: string,
                                    {
                                        username, fullname, description,
                                        profilePhotoUrl, coverPhotoUrl
                                    }) {
    return Profile.update({username, fullname, description, profilePhotoUrl, coverPhotoUrl}, {where: {userId}});
}

export async function searchUser(query: string) {
    return Profile.findAll({
        attributes: ['userId', 'username', 'fullname', 'profilePhotoUrl'],
        where: {
            fullname: {
                [Op.like]: `${query}%`
            }
        }
    });
}

export async function sendFriendRequest(senderId, receiverId) {
    const fRequest = await UserRelationShip.create({senderId, receiverId, type: userRelationship.PENDING});
    return fRequest !== null;
}

export async function getFriendRequests(userId) {
    return UserRelationShip.findAll({where: {receiverId: userId, type: userRelationship.PENDING}});
}

export async function handleFriendRequest(receiverId, senderId, action) {
    if (action === 'confirm') {
        return UserRelationShip.update({type: userRelationship.FRIEND}, {where: {receiverId, senderId}});
    }
    return UserRelationShip.destroy({where: {receiverId, senderId}});
}