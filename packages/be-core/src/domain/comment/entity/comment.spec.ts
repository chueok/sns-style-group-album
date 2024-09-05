import { CommentTypeEnum } from "../enum/comment-type-enum";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { v4 } from "uuid";
import { ContentId } from "../../content/entity/type/content-id";
import { UserComment } from "./comment";
import { UserId } from "../../user/entity/type/user-id";
import { isUUID } from "class-validator";

describe("Comment", () => {
  describe("UserCommet", () => {
    let comment: UserComment;
    const text = "Sample comment";
    beforeEach(async () => {
      const payload: CreateCommentEntityPayload<"user", "new"> = {
        text,
        contentId: v4() as ContentId,
        ownerId: v4() as UserId,
      };
      comment = await UserComment.new(payload);
    });

    it("should have the correct values", () => {
      expect(comment.type).toBe(CommentTypeEnum.USER_COMMENT);
      expect(comment.text).toBe(text);
      expect(comment.userTags).toEqual([]);
      expect(isUUID(comment.contentId)).toBeTruthy();
    });

    it("should change the text correctly", async () => {
      const newText = "Updated comment";
      await comment.changeText(newText);
      expect(comment.text).toBe(newText);
    });

    it("should extract user tags correctly", async () => {
      const userId = v4() as UserId;
      const text = `asdfasdfg${UserComment.TAG_PREFIX}${userId}${UserComment.TAG_SUFFIX}afglkhaskjldhfv`;
      await comment.changeText(text);
      expect(comment.userTags).toEqual([userId]);
    });

    it("should not extract invalid user tags", async () => {
      const userId = "invalid id string" as UserId;
      const text = `asdfasdfg${UserComment.TAG_PREFIX}${userId}${UserComment.TAG_SUFFIX}afglkhaskjldhfv`;
      await comment.changeText(text);
      expect(comment.userTags).not.toEqual([userId]);
    });

    it("should extract multiple user tags", async () => {
      const userId1 = v4() as UserId;
      const userId2 = v4() as UserId;

      const text = `asdfasdfg${UserComment.TAG_PREFIX}${userId1}${UserComment.TAG_SUFFIX}afglkha${UserComment.TAG_PREFIX}${userId2}${UserComment.TAG_SUFFIX}skjldhfv`;
      await comment.changeText(text);

      expect(comment.userTags).toEqual([userId1, userId2]);
    });

    it("should ignore duplicate user tags", async () => {
      const userId1 = v4() as UserId;
      const userId2 = v4() as UserId;
      const text = `asdfasdfg${UserComment.TAG_PREFIX}${userId1}${UserComment.TAG_SUFFIX}afglkha${UserComment.TAG_PREFIX}${userId1}${UserComment.TAG_SUFFIX}skjldhfv${UserComment.TAG_PREFIX}${userId2}${UserComment.TAG_SUFFIX}`;
      await comment.changeText(text);

      expect(comment.userTags).toEqual([userId1, userId2]);
    });

    it("should extract when class is created", async () => {
      const userId1 = v4() as UserId;
      const text = `asdfasdfg${UserComment.TAG_PREFIX}${userId1}${UserComment.TAG_SUFFIX}`;
      const payload: CreateCommentEntityPayload<"user", "new"> = {
        text,
        contentId: v4() as ContentId,
        ownerId: v4() as UserId,
      };
      comment = await UserComment.new(payload);

      expect(comment.userTags).toEqual([userId1]);
    });
  });

  // Add more tests as needed
});
