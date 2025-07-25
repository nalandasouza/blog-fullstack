import { db } from "./db.js";

async function setup() {
  const users_table = /*sql*/ `
    CREATE TABLE IF NOT EXISTS users (  
      id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(45) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      img VARCHAR(255) NULL
    );
  `;

  const posts_table = /*sql*/ `
    CREATE TABLE IF NOT EXISTS posts (
      id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(45) NOT NULL,
      \`desc\` VARCHAR(1000) NOT NULL,
      img VARCHAR(255) NOT NULL,
      date DATETIME NOT NULL,
      uid INT NOT NULL,
      INDEX uid_idx (uid ASC) VISIBLE,
      CONSTRAINT uid
          FOREIGN KEY (uid)
          REFERENCES users (id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
    )
  `;

  await db.execute(users_table);
  await db.execute(posts_table);

  console.log("Setup feito com sucesso!");
}

setup();
