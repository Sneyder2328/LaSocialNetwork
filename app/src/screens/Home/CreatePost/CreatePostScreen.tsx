import React, {useEffect, useState} from "react";
import {FlatList, StyleSheet, TextInput, TouchableOpacity, View} from "react-native";
import {ProfilePhoto} from "../../../components/ProfilePhoto";
import {useDispatch, useSelector} from "react-redux";
import {useNavigation} from "@react-navigation/native";
import {FontAwesome5} from '@expo/vector-icons';
import {HeaderActionButton} from "../../../components/HeaderActionButton";
import {
    askPermissionForCamera,
    askPermissionForCameraRoll,
    genUUID,
    getImgTypeForUri, getUri,
    ImageFile
} from "../../../utils/utils";
import * as ImagePicker from 'expo-image-picker';
import {COLOR_PRIMARY} from "../../../constants/Colors";
import {PreviewImage} from "../../../components/PreviewImage";
import {MyAppState} from "../../../modules/rootReducer";
import {createPost} from "../../../modules/Post/postsActions";

const optionsForImage = {
    allowsEditing: true,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7
};

const avatarDimens = 50;

export const CreatePostScreen = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    // const {isCreatingPost} = useSelector((state: MyAppState) => state.entities.newsFeed)
    const userId: string = useSelector((state: MyAppState) => state.auth.userId!!)
    const users = useSelector((state: MyAppState) => state.entities.users.entities)
    const currentUser = users[userId!!]
    const [imageFiles, setImageFiles] = useState<Array<ImageFile>>([]);
    const [text, setText] = useState("")

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (<HeaderActionButton title={'POST'} onPress={() => {
                console.log('post', imageFiles)
                if (text.length === 0 && imageFiles.length === 0) return
                dispatch(createPost({id: genUUID(), imageFiles, text, userId}))
                navigation.goBack()
            }}/>)
        })
        // navigation.setParams({text, userId})
    }, [text, userId, imageFiles])

    const openImagePickerAsync = async () => {
        if (!(await askPermissionForCameraRoll())) return
        const pickerResult = await ImagePicker.launchImageLibraryAsync(optionsForImage);
        processImageForPost(pickerResult)
    }

    const launchCameraAsync = async () => {
        if (!(await askPermissionForCamera())) return
        if (!(await askPermissionForCameraRoll())) return
        const pickerResult = await ImagePicker.launchCameraAsync(optionsForImage);
        processImageForPost(pickerResult)
    }

    const processImageForPost = (pickerResult: ImagePicker.ImagePickerResult) => {
        console.log('pickerResult=', pickerResult);
        if (!pickerResult.cancelled && pickerResult.uri) {
            const type = getImgTypeForUri(pickerResult.uri);
            if (!type) return alert("This type of file is not supported")
            const newImg: ImageFile = {
                uri: getUri(pickerResult.uri),
                name: new Date().getTime().toString(),
                type
            }
            setImageFiles([...imageFiles, newImg])
        }
    }

    const onImageRemoved = (uri: string) => {
        setImageFiles(imageFiles.filter((img) => img.uri !== uri))
    }

    return (<View style={styles.container}>
        <View style={styles.header}>
            <ProfilePhoto profilePhotoUrl={currentUser.profilePhotoUrl} size={avatarDimens}/>
            <TextInput placeholder={"What's happening?"} style={styles.input} autoFocus={true}
                       multiline={true} onChangeText={setText} value={text}/>
        </View>
        <View style={styles.bottom}>
            <FlatList
                data={imageFiles}
                renderItem={({item}) => (<PreviewImage uri={item.uri} onImageRemoved={onImageRemoved}/>)}
                keyExtractor={(item => item.name)} horizontal={true}/>
            <View style={styles.imgSelectors}>
                <TouchableOpacity onPress={openImagePickerAsync}>
                    <FontAwesome5 name="images" size={32} color={COLOR_PRIMARY} style={styles.imagePicker}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={launchCameraAsync}>
                    <FontAwesome5 name="camera" size={32} color={COLOR_PRIMARY} style={styles.imagePicker}/>
                </TouchableOpacity>
            </View>
        </View>
        {/*<FullOverlay isVisible={isCreatingPost}/>*/}
    </View>)
}


const styles = StyleSheet.create({
    container: {
        padding: 8,
        flex: 1,
        // justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        flex: 1,
        // backgroundColor: '#f00',
    },
    input: {
        marginLeft: 8,
        fontSize: 18,
        // backgroundColor: '#0f0',
        flex: 1,
        alignSelf: 'flex-start',
        minHeight: avatarDimens,
    },
    bottom: {
        // flex: 1,
        marginTop: 8,
        // position: 'relative',
        // position: 'absolute',
        // bottom: 8,
        // left: 4,
        // backgroundColor: '#0f0'
    },
    imgSelectors: {
        flexDirection: 'row',
        // backgroundColor: '#f00',
        alignItems: "center",
    },
    imagePicker: {
        marginLeft: 4,
        padding: 8,
        // backgroundColor: '#0f0',
    }
})