import { db } from "../db.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const q = req.query.cat
    ? "SELECT * FROM `posts` WHERE `cat` = ?"
    : "SELECT * FROM `posts`";

  const v = req.query.cat ? [req.query.cat] : [];

  try {
    const [rows, fields] = await db.execute(q, v);
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro ao buscar postagens.");
  }
};

export const getPost = async (req, res) => {
  const q =
    "SELECT p.id, `username`, `title`, `desc`, p.img, u.img AS userImg, `cat`, `date` FROM users u JOIN posts p ON u.id = p.uid WHERE p.id = ?";

  try {
    const [rows, fields] = await db.execute(q, [req.params.id]);
    if (!rows.length) return res.status(404).send("Postagem não encontrada.");
    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro ao buscar a postagem.");
  }
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`title`, `desc`, `img`, `cat`, `date`, `uid`) VALUES (?, ?, ?, ?, ?, ?)";

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    try {
      await db.execute(q, values);
      return res.status(201).send("Post has been created.");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;
    const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

    try {
      const [rows, fields] = await db.execute(q, [postId, userInfo.id]);
      return res.status(200).send("Post deletado!");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Erro ao deletar postagem.");
    }
  });
};

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "jwtkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = req.params.id;

    const q =
      "UPDATE posts SET `title`=?, `desc`=?, `img`=?, `cat`=? WHERE `id` = ? AND `uid` = ?";

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
    ];

    try {
      await db.execute(q, [...values, postId, userInfo.id]);
      return res.status(201).send("Post has been updated.");
    } catch (err) {
      console.error(err);
      return res.status(500).json(err);
    }
  });
};
