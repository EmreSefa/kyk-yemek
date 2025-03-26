import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useMealComments, MealComment } from "../hooks/useMealComments";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface CommentItemProps {
  comment: MealComment;
  onDelete: (comment: MealComment) => void;
  isCurrentUser: boolean;
}

const CommentItem = ({
  comment,
  onDelete,
  isCurrentUser,
}: CommentItemProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Format the date as "X minutes/hours/days ago"
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: tr,
  });

  // Get display name with fallback to username or anonymous
  const displayName =
    comment.profiles?.display_name ||
    comment.user_id.substring(0, 8) ||
    "Anonim Kullanıcı";

  return (
    <View
      style={[
        styles.commentItem,
        isDark ? styles.commentItemDark : styles.commentItemLight,
      ]}
    >
      <View style={styles.commentHeader}>
        <View style={styles.userInfo}>
          <View
            style={[
              styles.avatarCircle,
              isDark ? styles.avatarCircleDark : styles.avatarCircleLight,
            ]}
          >
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.userName,
                isDark ? styles.userNameDark : styles.userNameLight,
              ]}
            >
              {displayName}
            </Text>
            <Text
              style={[
                styles.commentDate,
                isDark ? styles.commentDateDark : styles.commentDateLight,
              ]}
            >
              {formattedDate}
            </Text>
          </View>
        </View>

        {isCurrentUser && (
          <View style={styles.commentActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => onDelete(comment)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name="trash"
                size={16}
                color={isDark ? "#CCCCCC" : "#666666"}
              />
            </Pressable>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.commentText,
          isDark ? styles.commentTextDark : styles.commentTextLight,
        ]}
      >
        {comment.comment}
      </Text>
    </View>
  );
};

interface CommentsSectionProps {
  mealId: number;
}

export function CommentsSection({ mealId }: CommentsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);
  const {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    deleteComment,
  } = useMealComments(mealId);

  const [newComment, setNewComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Handle focusing the input
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      Alert.alert(
        "Giriş Yapınız",
        "Yorum yapabilmek için giriş yapmanız gerekmektedir."
      );
      return;
    }

    if (!newComment.trim()) return;

    const success = await addComment(newComment);
    if (success) {
      setNewComment("");
    }
  };

  const confirmDeleteComment = (comment: MealComment) => {
    Alert.alert("Yorumu Sil", "Bu yorumu silmek istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => deleteComment(comment.id),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text
          style={[
            styles.sectionTitle,
            isDark ? styles.sectionTitleDark : styles.sectionTitleLight,
          ]}
        >
          Yorumlar
        </Text>
        <Text
          style={[
            styles.commentCount,
            isDark ? styles.commentCountDark : styles.commentCountLight,
          ]}
        >
          {comments.length}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? "#FFFFFF" : "#000000"}
        />
      ) : error ? (
        <Text
          style={[
            styles.errorText,
            isDark ? styles.errorTextDark : styles.errorTextLight,
          ]}
        >
          {error}
        </Text>
      ) : comments.length === 0 ? (
        <Text
          style={[
            styles.noCommentsText,
            isDark ? styles.noCommentsTextDark : styles.noCommentsTextLight,
          ]}
        >
          Henüz yorum yapılmamış. İlk yorumu siz yapın!
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.commentsList}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={true}
        >
          {comments.map((item) => (
            <CommentItem
              key={item.id.toString()}
              comment={item}
              onDelete={confirmDeleteComment}
              isCurrentUser={user?.id === item.user_id}
            />
          ))}
        </ScrollView>
      )}

      {/* Comment input area */}
      <View style={styles.inputWrapper}>
        <View
          style={[
            styles.inputContainer,
            isDark ? styles.inputContainerDark : styles.inputContainerLight,
            isFocused && styles.inputContainerFocused,
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
            ]}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Bir yorum yazın..."
            placeholderTextColor={isDark ? "#AAAAAA" : "#999999"}
            multiline={true}
            numberOfLines={1}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            blurOnSubmit={false}
            scrollEnabled={false}
          />
          <Pressable
            style={[
              styles.sendButton,
              isDark ? styles.sendButtonDark : styles.sendButtonLight,
              (!newComment.trim() || isSubmitting) && styles.disabledButton,
            ]}
            onPress={handleAddComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  sectionTitleLight: {
    color: "#000000",
  },
  sectionTitleDark: {
    color: "#FFFFFF",
  },
  commentCount: {
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  commentCountLight: {
    color: "#666666",
  },
  commentCountDark: {
    color: "#AAAAAA",
  },
  commentsList: {
    paddingBottom: 16,
  },
  commentItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentItemLight: {
    backgroundColor: "#F5F5F5",
  },
  commentItemDark: {
    backgroundColor: "#2A2A2C",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarCircleLight: {
    backgroundColor: "#4A6572",
  },
  avatarCircleDark: {
    backgroundColor: "#687F8C",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
  },
  userNameLight: {
    color: "#000000",
  },
  userNameDark: {
    color: "#FFFFFF",
  },
  commentDate: {
    fontSize: 12,
  },
  commentDateLight: {
    color: "#666666",
  },
  commentDateDark: {
    color: "#AAAAAA",
  },
  commentActions: {
    flexDirection: "row",
  },
  actionButton: {
    paddingHorizontal: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentTextLight: {
    color: "#333333",
  },
  commentTextDark: {
    color: "#EEEEEE",
  },
  inputWrapper: {
    marginTop: 8,
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  inputContainerLight: {
    backgroundColor: "#F5F5F5",
  },
  inputContainerDark: {
    backgroundColor: "#2A2A2C",
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
  },
  inputLight: {
    color: "#000000",
  },
  inputDark: {
    color: "#FFFFFF",
  },
  sendButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonLight: {
    backgroundColor: "#4A6572",
  },
  sendButtonDark: {
    backgroundColor: "#687F8C",
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    padding: 16,
    textAlign: "center",
    fontSize: 14,
  },
  errorTextLight: {
    color: "#FF3B30",
  },
  errorTextDark: {
    color: "#FF6B6B",
  },
  noCommentsText: {
    padding: 16,
    textAlign: "center",
    fontSize: 14,
    fontStyle: "italic",
  },
  noCommentsTextLight: {
    color: "#666666",
  },
  noCommentsTextDark: {
    color: "#AAAAAA",
  },
  inputContainerFocused: {
    borderWidth: 1,
    borderColor: "#4A6572",
  },
});
