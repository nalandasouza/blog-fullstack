import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  //CHECK EXISTING USER
  // const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  // db.query(q, [req.body.email, req.body.username], (err, data) => {
  //   if (err) return res.json(err);
  //   if (data.length) return res.status(409).json("User already exists!");

  //   //Hash the password and create a user
  //   const salt = bcrypt.genSaltSync(10);
  //   const hash = bcrypt.hashSync(req.body.password, salt);

  //   const q = "INSERT INTO users(`username`,`email`,`password`) VALUES (?)";
  //   const values = [
  //     req.body.username,
  //     req.body.email,
  //     hash
  //   ];

  //   db.query(q, [values], (err, data) => {
  //     if (err) return res.json(err);
  //     return res.status(200).json("User has been created.")
  //   });
  // });

  try {
    const qSelect = "SELECT * FROM users WHERE email = ? OR username = ?";

    const [queriedUser] = await db.execute(qSelect, [
      req.body.email,
      req.body.username,
    ]);
    if (queriedUser.length) return res.status(409).json("User already exists!");

    //Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const qInsert =
      "INSERT INTO users(`username`,`email`,`password`) VALUES (?, ?, ?)";

    const values = [req.body.username, req.body.email, hash];

    const [registeredUser] = await db.execute(qInsert, values);
    if (registeredUser.affectedRows === 0)
      return res.status(500).json("User could not be created");

    return res.status(201).json("User created");
  } catch (error) {
    return res.json(error);
  }
};

export const login = async (req, res) => {
  //CHECK USER

  try {
    const q = "SELECT * FROM users WHERE username = ?";
    const [queriedUser] = await db.execute(q, [req.body.username]);
    if (queriedUser.length === 0)
      return res.status(404).json("User not found!");

    //CHECK PASSWORD
    const isPassowordCorrect = bcrypt.compareSync(
      req.body.password,
      queriedUser[0].password
    );
    if (!isPassowordCorrect) return res.status(400).json("Wrong password!");

    const token = jwt.sign({ id: queriedUser[0].id }, "jwtkey");
    const { password, ...other } = queriedUser[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  } catch (error) {
    return res.json(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true
  }).status(200).json("User has been logged out.");
};
