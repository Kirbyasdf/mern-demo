const router = require("express").Router();
const { check, validationResult } = require("express-validator");
const Post = require("../models/Post.js");
const Profile = require("../models/Profile.js");
const User = require("../models/User.js");
const { clientVerify } = require("../middleware/auth.js");

router
  .route("/")
  .post([clientVerify, [check("text").not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ sucess: false, errors: errors.array() });
    }
    const { text } = req.body;

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Sever ERROR" });
    }
  })
  .get(async (req, res) => {
    try {
      const posts = await Post.find();
      res.status(200).json({ sucess: true, count: posts.length, data: posts });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Sever ERROR" });
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ msg: "no post found with id: " + req.params.id });
      }

      res.status(200).json({ sucess: true, data: post });
    } catch (err) {
      console.error(err.message);
      if (err.kid == "ObjectId") {
        return res.status(404).json({ sucess: false, msg: "No post found with id :" + id });
      }
      res.status(500).json({ sucess: false, msg: "SERVER ERROR" });
    }
  })
  .delete(clientVerify, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if (!post) {
        return res.status(404).json({ msg: "no post found with id: " + req.params.id });
      }

      if (post.user.toString() !== req.user.id) {
        return res.status(401).send("not authorized to delete");
      }
      post.remove();

      res.send("deleted");
    } catch (err) {
      console.error(err.message);
      if (err.kid == "ObjectId") {
        return res.status(404).json({ sucess: false, msg: "No post found with id :" + id });
      }
      res.status(500).json({ sucess: false, msg: "SERVER ERROR" });
    }
  });

router.patch("/like/:id", clientVerify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
      res.status(400).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json({ sucess: true, data: post.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

router.patch("/unlike/:id", clientVerify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post);
    if (post.likes.filter((like) => like.user.toString() === req.user.id).length === 0) {
      res.status(400).json({ msg: "post has not yet been liked " });
    }

    const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json({ sucess: true, data: post.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

router
  .route("/comments/:id")
  .post([clientVerify, [check("text").not().isEmpty()]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ sucess: false, errors: errors.array() });
    }
    const { text } = req.body;
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json({ sucess: true, length: post.comments.length, data: post.comments });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Sever ERROR" });
    }
  });

router.delete("/:id/:comment_id", clientVerify, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find((comment) => comment.id === req.params.comment_id);

    if (!comment) {
      return res.status(404).json({ msg: "comment does not exist" });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not  authorized to delete comment" });
    }

    const removeIndex = post.likes.map((comment) => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json({ sucess: true, length: post.comments.length, data: post.comments });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Sever ERROR" });
  }
});

module.exports = router;
