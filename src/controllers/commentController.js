import commentModel from "../models/commentModel.js";
import { io } from "../index.js";
class CommentController {
  async createComment(req, res) {
    try {
      const { content, tourId, parentId } = req.body;
      const userId = req.user._id;

      const newComment = new commentModel({
        owner: userId,
        content,
        tourId,
      });

      const savedComment = await newComment.save();
      savedComment.parentId = savedComment._id;

      await savedComment.save();
      io.emit("commentAdded", savedComment);

      return res.status(201).json({
        success: true,
        data: savedComment,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getCommentsForTour(req, res) {
    try {
      const { tourId } = req.params;

      const comments = await commentModel
        .find({ tourId })
        .populate("replies");

      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteComment(req, res) {
    try {
      const { commentId } = req.params;

      if (!commentId || commentId === "undefined") {
        return res.status(400).json({
          success: false,
          error: "Invalid commentId",
        });
      }

      const comment = await commentModel.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: "Comment not found",
        });
      }

      await commentModel.findByIdAndRemove(commentId);

      io.emit("commentDeleted", commentId);

      return res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async editComment(req, res) {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.user._id;

      const comment = await commentModel.findById(commentId);

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: "Comment not found",
        });
      }

      // Verify user's ownership and permissions
      if (comment.owner.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: "Permission denied: User does not own this comment.",
        });
      }

      // Update the comment's content
      comment.content = content;
      await comment.save();

      io.emit("commentUpdated", comment);

      return res.status(200).json({
        success: true,
        message: "Comment updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async reportComment(req, res) {
    try {
        const { commentId } = req.params;

        const comment = await commentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                error: "Comment not found",
            });
        }

        if (comment.reported) {
            return res.status(400).json({
                success: false,
                error: "Comment already reported",
            });
        }

        comment.reported = true;
        await comment.save();

        io.emit("commentReported", comment);

        return res.status(200).json({
            success: true,
            message: "Comment reported successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

}

export default new CommentController();
