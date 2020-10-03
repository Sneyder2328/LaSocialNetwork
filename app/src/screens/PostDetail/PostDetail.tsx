import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableHighlight,
    View
} from "react-native";
import React, {useState} from "react";
import {PostObject} from "../../reducers/postsReducer";
import {useRoute} from "@react-navigation/native";
import {Avatar} from "react-native-paper";
import {InteractionItem} from "../../components/InteractionItem";
import {dislikePost, likePost} from "../../actions/postsActions";
import {AntDesign, FontAwesome} from "@expo/vector-icons";
import {COLOR_PRIMARY, COLOR_PRIMARY_LIGHT2} from "../../constants/Colors";
import {useDispatch, useSelector} from "react-redux";
import {useTimeSincePublished} from "../../hooks/updateRelativeTimeHook";
import Image from 'react-native-scalable-image';
import {Comment} from "../../components/Comment";
import {MyAppState} from "../../reducers/rootReducer";
import {AddNewComment} from "../../components/AddNewComment";
import {loadPreviousComments} from "../../actions/commentActions";


const LoadMoreComments: React.FC<{ onLoadMoreComments: () => any; isLoadingPreviousComments: boolean }> = ({onLoadMoreComments, isLoadingPreviousComments}) => {
    return (<TouchableHighlight underlayColor={'#fff'} onPress={onLoadMoreComments} activeOpacity={0.6}>
        <View style={{flexDirection: 'row', alignItems: 'center', margin: 8}}>
            <FontAwesome name="angle-up" size={24} color={COLOR_PRIMARY_LIGHT2}/>
            <Text style={{color: COLOR_PRIMARY_LIGHT2, marginLeft: 8, fontWeight: "bold"}}>Load more comments...</Text>
            <ActivityIndicator size="small" color={COLOR_PRIMARY_LIGHT2} style={{marginLeft: 8}}
                               animating={isLoadingPreviousComments}/>
        </View>
    </TouchableHighlight>);
}

export const PostDetail = () => {
    const dispatch = useDispatch()
    const route = useRoute()
    // @ts-ignore
    const {postId}: { postId: string } = route.params;
    // // @ts-ignore
    // const {postAuthor}: { postAuthor: UserObject } = route.params;
    // console.log('pdetail=', post, postAuthor);

    const {entities, metas} = useSelector((state: MyAppState) => state.entities.posts)
    const users = useSelector((state: MyAppState) => state.entities.users.entities)
    const {userId} = useSelector(((state: MyAppState) => state.auth))

    const currentUser = users[userId!!]
    const post = entities[postId]
    const postMeta = metas[postId]
    const postAuthor = users[post.userId]

    const timeSincePublished = useTimeSincePublished(post.createdAt)

    const onLoadMoreComments = () => {
        console.log('onLoadMoreComments');
        dispatch(loadPreviousComments(postId, post.comments.length, 10))
    }

    return (<View style={styles.container}>
        <View style={styles.header}>
            <Avatar.Image
                source={postAuthor?.profilePhotoUrl ? {uri: postAuthor.profilePhotoUrl} : require('../../assets/images/ic_person.png')}
                size={54} style={styles.authorAvatar}/>
            <View style={{marginLeft: 4}}>
                <Text style={styles.username}>{postAuthor.fullname}</Text>
                <Text style={styles.createdAt}>{timeSincePublished}</Text>
            </View>
        </View>
        <View style={styles.content}>
            <Text style={styles.text}>{post.text}</Text>
            <FlatList data={post.images} renderItem={({item}) => {
                return <Image style={styles.imageItem} width={Dimensions.get('window').width} source={{uri: item.url}}/>
            }} keyExtractor={(item => item.url)}/>
        </View>
        <View style={styles.interactions}>
            <InteractionItem count={post.likesCount} onPress={() => {
                dispatch(likePost(post.id, post.likeStatus === 'like'))
            }}>
                <AntDesign name="like1" size={24}
                           color={post.likeStatus === 'like' ? COLOR_PRIMARY : COLOR_PRIMARY_LIGHT2}/>
            </InteractionItem>
            <InteractionItem count={post.dislikesCount} onPress={() => {
                dispatch(dislikePost(post.id, post.likeStatus === 'dislike'))
            }}>
                <AntDesign name="dislike1" size={24}
                           color={post.likeStatus === 'dislike' ? COLOR_PRIMARY : COLOR_PRIMARY_LIGHT2}/>
            </InteractionItem>
            <InteractionItem count={post.commentsCount} onPress={() => {
                console.log('comment clicked!')

            }}>
                <FontAwesome name="comment" size={24} color={COLOR_PRIMARY_LIGHT2}/>
            </InteractionItem>
            <InteractionItem count={0} onPress={() => console.log('share clicked!')}>
                <FontAwesome name="share" size={24} color={COLOR_PRIMARY_LIGHT2}/>
            </InteractionItem>
        </View>
        {post.commentsCount !== post.comments.length && <LoadMoreComments onLoadMoreComments={onLoadMoreComments}
                                                                          isLoadingPreviousComments={postMeta.isLoadingPreviousComments || false}/>}
        <FlatList data={post.comments} renderItem={({item}) => (<Comment commentId={item}/>)}
                  keyExtractor={(item => item)}/>
        <AddNewComment currentUser={currentUser} post={post}/>
    </View>)
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#fff',
        marginTop: 4,
        marginBottom: 4,
        // width: '100%'
    },
    header: {
        flexDirection: 'row',
    },
    content: {},
    authorAvatar: {},
    username: {
        fontWeight: 'bold',
    },
    createdAt: {
        color: "#9992a0"
    },
    text: {},
    interactions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    imageItem: {
        marginTop: 2,
        marginBottom: 2
    }
})