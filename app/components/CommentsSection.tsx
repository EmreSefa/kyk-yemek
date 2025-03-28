import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useMealComments, MealComment } from "../hooks/useMealComments";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface CommentsSectionProps {
  mealId: number;
}

export function CommentsSection({ mealId }: CommentsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    deleteComment,
  } = useMealComments(mealId);

  const [newComment, setNewComment] = useState("");

  // Handle adding a new comment
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

  // Handle deleting a comment
  const handleDeleteComment = (commentId: number) => {
    Alert.alert("Yorumu Sil", "Bu yorumu silmek istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => deleteComment(commentId),
      },
    ]);
  };

  // Render a single comment
  const renderComment = (comment: MealComment) => {
    const isCurrentUser = user?.id === comment.user_id;
    const displayName =
      comment.profiles?.display_name ||
      comment.user_id.substring(0, 8) ||
      "Anonim Kullanıcı";

    const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
      addSuffix: true,
      locale: tr,
    });

    return (
      <View
        key={comment.id}
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
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteComment(comment.id)}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={isDark ? "#CCCCCC" : "#666666"}
              />
            </TouchableOpacity>
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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

      {/* Comments List */}
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? "#FFFFFF" : "#000000"}
          style={styles.loader}
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
        <ScrollView contentContainerStyle={styles.commentsList}>
          {comments.map(renderComment)}
        </ScrollView>
      )}

      {/* Comment Input Section */}
      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputContainerDark : styles.inputContainerLight,
        ]}
      >
        <TextInput
          style={[styles.input, isDark ? styles.inputDark : styles.inputLight]}
          placeholder="Yorumunuzu yazın..."
          placeholderTextColor={isDark ? "#AAAAAA" : "#999999"}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newComment.trim() && styles.sendButtonDisabled,
          ]}
          disabled={!newComment.trim() || isSubmitting}
          onPress={handleAddComment}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  commentCountLight: {
    backgroundColor: "#E0E0E0",
    color: "#666666",
  },
  commentCountDark: {
    backgroundColor: "#444444",
    color: "#CCCCCC",
  },
  commentsList: {
    paddingBottom: 8,
  },
  // Comment Item Styles
  commentItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentItemLight: {
    backgroundColor: "#F5F5F5",
  },
  commentItemDark: {
    backgroundColor: "#2A2A2A",
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    backgroundColor: "#738F9E",
  },
  avatarText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  userName: {
    fontWeight: "500",
    fontSize: 14,
  },
  userNameLight: {
    color: "#333333",
  },
  userNameDark: {
    color: "#FFFFFF",
  },
  commentDate: {
    fontSize: 12,
  },
  commentDateLight: {
    color: "#888888",
  },
  commentDateDark: {
    color: "#BBBBBB",
  },
  deleteButton: {
    padding: 4,
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
  // Input Section Styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainerLight: {
    backgroundColor: "#F0F0F0",
  },
  inputContainerDark: {
    backgroundColor: "#2A2A2A",
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 14,
    maxHeight: 100,
  },
  inputLight: {
    color: "#333333",
  },
  inputDark: {
    color: "#FFFFFF",
  },
  sendButton: {
    backgroundColor: "#4A6572",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  // Misc Styles
  loader: {
    marginVertical: 20,
  },
  errorText: {
    textAlign: "center",
    marginVertical: 16,
  },
  errorTextLight: {
    color: "#E53935",
  },
  errorTextDark: {
    color: "#FF8A80",
  },
  noCommentsText: {
    textAlign: "center",
    marginVertical: 20,
    fontStyle: "italic",
  },
  noCommentsTextLight: {
    color: "#999999",
  },
  noCommentsTextDark: {
    color: "#BBBBBB",
  },
});
