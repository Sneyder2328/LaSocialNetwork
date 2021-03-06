import { AppThunk } from "../../store";
import { MessagesApi } from "./messagesApi";
import { ConversationObject, MessageObject, messagesActions } from "./messagesReducer";
import { normalize } from "normalizr";
import { conversation, message } from "../../api/schema";
import { HashTable } from "../../utils/utils";
import { UserObject, usersActions } from "../User/userReducer";

const MESSAGES_LIMIT = 20;
export const fetchMessages = (otherUserId: string): AppThunk => async (dispatch, getStore) => {
    if (getStore().messages.users?.[otherUserId]?.isLoading) return
    dispatch(messagesActions.fetchMessagesRequest({ otherUserId }))
    try {
        const currentOffset: string | undefined = getStore().messages.users?.[otherUserId]?.offset
        const response = await MessagesApi.getMessages(otherUserId, currentOffset, MESSAGES_LIMIT)
        const messages = normalize(response.data, [message])?.entities?.messages as HashTable<MessageObject>
        dispatch(messagesActions.fetchMessagesSuccess({ messages, otherUserId }))
    } catch (err) {
        console.log('fetchMessages err', err);
    }
}

export const fetchConversations = (): AppThunk => async (dispatch) => {
    dispatch(messagesActions.fetchConversationsRequest())
    try {
        const response = await MessagesApi.getConversations()
        const normalizedData = normalize(response.data, [conversation]);
        console.log('aca xDDD', normalizedData)
        const messages = normalizedData.entities.messages as HashTable<MessageObject> | undefined
        const conversations = normalizedData.entities.conversations as HashTable<ConversationObject> | undefined
        const users = normalizedData.entities.users as HashTable<UserObject> | null
        users && dispatch(usersActions.setUsers(users))
        conversations && dispatch(messagesActions.fetchConversationsSuccess({ messages, conversations }))
        console.log('conv');
        console.log(messages);
        
        
    } catch (err) {
        console.log('fetchConversations err', err)
        dispatch(messagesActions.fetchConversationsError())
    }
}