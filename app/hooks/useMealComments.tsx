import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { mealService } from "../../lib/services/mealService";

export interface MealComment {
  id: number;
  meal_id: number;
  user_id: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const useMealComments = (mealId: number) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<MealComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all comments for a meal
  const fetchComments = useCallback(async () => {
    if (!mealId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await mealService.getMealComments(
        mealId,
        user ? user.id : undefined
      );
      setComments(data as MealComment[]);
    } catch (err) {
      console.error("Error fetching meal comments:", err);
      setError("Yorumlar yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [mealId, user]);

  // Load comments on mount and when mealId or user changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add a new comment
  const addComment = useCallback(
    async (comment: string) => {
      if (!user || !mealId || !comment.trim()) return false;

      setIsSubmitting(true);
      setError(null);

      try {
        await mealService.addComment(mealId, user.id, comment.trim());
        // Refresh comments to include the new one
        await fetchComments();
        return true;
      } catch (err) {
        console.error("Error adding comment:", err);
        setError("Yorum eklenirken bir hata oluştu.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mealId, user, fetchComments]
  );

  // Update an existing comment
  const updateComment = useCallback(
    async (commentId: number, comment: string) => {
      if (!user || !commentId || !comment.trim()) return false;

      setIsSubmitting(true);
      setError(null);

      try {
        await mealService.updateComment(commentId, user.id, comment.trim());
        // Refresh comments to include the updated one
        await fetchComments();
        return true;
      } catch (err) {
        console.error("Error updating comment:", err);
        setError("Yorum güncellenirken bir hata oluştu.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, fetchComments]
  );

  // Delete a comment
  const deleteComment = useCallback(
    async (commentId: number) => {
      if (!user || !commentId) return false;

      setIsSubmitting(true);
      setError(null);

      try {
        await mealService.deleteComment(commentId, user.id);
        // Refresh comments to remove the deleted one
        await fetchComments();
        return true;
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError("Yorum silinirken bir hata oluştu.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, fetchComments]
  );

  return {
    comments,
    isLoading,
    isSubmitting,
    error,
    addComment,
    updateComment,
    deleteComment,
    fetchComments,
  };
};
