import dotenv from "dotenv";
dotenv.config();

import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import { createMotomon } from "./handlers";

const app = new Elysia()
                        .use(cors())
                        .get("/", () => "Hello Elysia")
                        .get("/createMonster", () => createMotomon())
                        // we can have multiple handlers
                        // .get("/randomChest", () => randomChest())
                        // .get("/randomMonster", () => randomMonster(location))
                        // .get("/randomMonsterBattle", () => randomMonsterBattle(location))  
                        .listen(process.env.PORT || 3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);