import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";
import { useMealComments, MealComment } from "../hooks/useMealComments";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface CommentItemProps {
  comment: MealComment;
  onEdit: (comment: MealComment) => void;
  onDelete: (comment: MealComment) => void;
  isCurrentUser: boolean;
}

const CommentItem = ({
  comment,
  onEdit,
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

  const displayName = comment.profiles?.display_name || "Anonim Kullanıcı";

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
              onPress={() => onEdit(comment)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name="pencil"
                size={16}
                color={isDark ? "#CCCCCC" : "#666666"}
              />
            </Pressable>
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

      {!comment.is_approved && (
        <Text style={styles.pendingText}>Onay bekliyor</Text>
      )}
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
  const {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    updateComment,
    deleteComment,
  } = useMealComments(mealId);

  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<MealComment | null>(
    null
  );

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

  const handleEditComment = async () => {
    if (!editingComment) return;

    const success = await updateComment(
      editingComment.id,
      editingComment.comment
    );
    if (success) {
      setEditingComment(null);
    }
  };

  const startEditingComment = (comment: MealComment) => {
    setEditingComment(comment);
  };

  const cancelEditingComment = () => {
    setEditingComment(null);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
          {comments.filter((c) => c.is_approved).length}
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
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommentItem
              comment={item}
              onEdit={startEditingComment}
              onDelete={confirmDeleteComment}
              isCurrentUser={user?.id === item.user_id}
            />
          )}
          contentContainerStyle={styles.commentsList}
        />
      )}

      {/* Comment input area */}
      {editingComment ? (
        <View
          style={[
            styles.inputContainer,
            isDark ? styles.inputContainerDark : styles.inputContainerLight,
          ]}
        >
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
            ]}
            value={editingComment.comment}
            onChangeText={(text) =>
              setEditingComment({ ...editingComment, comment: text })
            }
            placeholder="Yorumunuzu düzenleyin..."
            placeholderTextColor={isDark ? "#AAAAAA" : "#999999"}
            multiline
          />
          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.cancelButton,
                isDark ? styles.cancelButtonDark : styles.cancelButtonLight,
              ]}
              onPress={cancelEditingComment}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  isDark
                    ? styles.cancelButtonTextDark
                    : styles.cancelButtonTextLight,
                ]}
              >
                İptal
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.sendButton,
                isDark ? styles.sendButtonDark : styles.sendButtonLight,
                (!editingComment.comment.trim() || isSubmitting) &&
                  styles.disabledButton,
              ]}
              onPress={handleEditComment}
              disabled={!editingComment.comment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>Güncelle</Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.inputContainer,
            isDark ? styles.inputContainerDark : styles.inputContainerLight,
          ]}
        >
          <TextInput
            style={[
              styles.input,
              isDark ? styles.inputDark : styles.inputLight,
            ]}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Bir yorum yazın..."
            placeholderTextColor={isDark ? "#AAAAAA" : "#999999"}
            multiline
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
      )}
    </KeyboardAvoidingView>
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
  pendingText: {
    fontSize: 12,
    fontStyle: "italic",
    color: "#FF9500",
    marginTop: 8,
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
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
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
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  cancelButtonLight: {
    backgroundColor: "#DDDDDD",
  },
  cancelButtonDark: {
    backgroundColor: "#3A3A3C",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButtonTextLight: {
    color: "#666666",
  },
  cancelButtonTextDark: {
    color: "#AAAAAA",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
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
});
