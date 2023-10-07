import dotenv from "dotenv";
dotenv.config();

import { Elysia } from "elysia";
import { createMotomon } from "./handlers";

const app = new Elysia()
                        .get("/", () => "Hello Elysia")
                        .get("/createMonster", () => createMotomon())
                        .listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);