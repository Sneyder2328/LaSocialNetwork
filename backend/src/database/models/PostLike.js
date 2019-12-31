module.exports = (sequelize, DataTypes, User, Post) => {
    const PostLike = sequelize.define('Post_Like', {
        postId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: 'postId_userId',
            references: {
                model: Post,
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: 'postId_userId',
            references: {
                model: User,
                key: 'id'
            }
        },
        isLike: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
    PostLike.removeAttribute('id');

    PostLike.beforeUpsert(async (postLike, _) => {
        console.log('beforeUpsert');
        const post = await Post.findByPk(postLike.postId);
        if (postLike.isLike)
            await post.increment('likesCount', {by: 1});
        else
            await post.increment('dislikesCount', {by: 1});
    });

    PostLike.beforeDestroy(async (postLike, _) => {
        console.log('beforeDestroy');
        const post = await Post.findByPk(postLike.postId);
        if (postLike.isLike)
            await post.decrement('likesCount', {by: 1});
        else
            await post.decrement('dislikesCount', {by: 1});
    });

    return PostLike;
};