import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Message from '../components/Message';
import Screen from '../components/Screen';
import AuthContext from '../context/AuthContext';
import useChat from '../hooks/useChat';
import { RootStackParamList } from '../types/types';
import Colors from '../utils/Colors';

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  membersSection: {},
  membersTitleText: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userProfile: {
    width: 34,
    height: 34,
    backgroundColor: Colors.BLACK,
    borderRadius: 34 / 2,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfileText: {
    color: Colors.WHITE,
  },
  messageList: {
    flex: 1,
    marginVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    marginRight: 10,
    borderRadius: 24,
    borderColor: Colors.BLACK,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    maxHeight: 50,
    justifyContent: 'center',
  },
  textInput: {
    // 안드로이드 TextInput padding 지우기
    paddingTop: 0,
    paddingBottom: 0,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BLACK,
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
  sendIcon: {
    color: Colors.WHITE,
    fontSize: 18,
  },
  messageSeparator: {
    height: 8,
  },
});

const disabledSendButtonStyle = [styles.sendButton, { backgroundColor: Colors.GRAY }];

const ChatScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { other, userIds } = params;

  const { loadingChat, chat, sendMessage, messages, loadingMessages } = useChat(userIds);
  const [text, setText] = useState('');
  const sendDisabled = useMemo(() => text.length === 0, [text]);
  const { user: me } = useContext(AuthContext);
  const loading = loadingChat || loadingMessages;

  const onChangeText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const onPressSendButton = useCallback(() => {
    if (me != null) {
      sendMessage(text, me);
      setText('');
    }
  }, [me, sendMessage, text]);

  const renderChat = useCallback(() => {
    if (chat == null) {
      return null;
    }

    return (
      <View style={styles.chatContainer}>
        <View style={styles.membersSection}>
          <Text style={styles.membersTitleText}>대화상대</Text>
          <FlatList
            data={chat?.users}
            renderItem={({ item: user }) => (
              <View style={styles.userProfile}>
                <Text style={styles.userProfileText}>{user.name[0]}</Text>
              </View>
            )}
            horizontal
          />
        </View>

        <FlatList
          inverted
          style={styles.messageList}
          data={messages}
          renderItem={({ item: message }) => {
            return (
              <Message
                name={message.user.name}
                text={message.text}
                createdAt={message.createdAt}
                isOtherMessage={message.user.userId !== me?.userId}
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.messageSeparator} />}
        />

        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={text}
              onChangeText={onChangeText}
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={onPressSendButton}
            style={sendDisabled ? disabledSendButtonStyle : styles.sendButton}
            disabled={sendDisabled}>
            <Icon style={styles.sendIcon} name="send" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [chat, me?.userId, messages, onChangeText, onPressSendButton, sendDisabled, text]);

  return (
    <Screen title={other.name}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          renderChat()
        )}
      </View>
    </Screen>
  );
};

export default ChatScreen;
