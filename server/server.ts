// ESM
import Fastify, { FastifyRequest } from "fastify";
import mongoose from "mongoose";
import cors from "@fastify/cors";
import dotenv from "dotenv";

import { getSession, updateSession } from "./service/session.js";
import {
  deleteContest,
  getContests,
  updateContests,
} from "./service/contests.js";
import { ContestDTO } from "./types.js";
import { getLogs } from "./service/logs.js";
import { fetchLeaderbord, getContestInfo } from "./lib/parser.js";
import Log from "./models/Log.js";

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

const fastify = Fastify({
  exposeHeadRoutes: true,
  logger: true,
});

fastify.register(cors);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) throw new Error("MONDO URL NOT FOUND");

try {
  mongoose.connect(MONGODB_URI);
} catch (e) {
  console.error(e);
}

//#region Contests

fastify.get("/contests", async function (request, reply) {
  const query = request.query;
  const res = await getContests();
  reply.send({ success: true, data: res });
});

fastify.post(
  "/contests",
  function (
    request: FastifyRequest<{ Body: { contests: ContestDTO[] } }>,
    reply
  ) {
    const body = request.body;
    if (!("contests" in body)) reply.status(400);
    const res = updateContests(body.contests);
    reply.status(200);
  }
);
fastify.delete(
  "/contests/:id",
  async function (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { contests: ContestDTO[] };
    }>,
    reply
  ) {
    const { id } = request.params;

    if (!id) {
      reply.status(400);
      return;
    }

    const res = await deleteContest(id);
    // updateOne(query.contest, query.from, query.to);
    reply.status(200);
  }
);

//#endregion

//#region Session
fastify.get("/session", async function (request, reply) {
  const res = await getSession();
  reply.send(res);
});

fastify.post(
  "/session",
  async function (
    request: FastifyRequest<{ Body: { name: string; value: string } }>,
    reply
  ) {
    const body = request.body;
    const res = await updateSession(body.value);
    reply.code(200);
  }
);
//#endregion

fastify.get(
  "/logs",
  async function (
    request: FastifyRequest<{
      Querystring: { time: string; type: string };
      Body: { name: string; value: string };
    }>,
    reply
  ) {
    const { time, type } = request.query;
    const res = await getLogs(time, type);
    if (res?.success) {
      reply.send({
        success: true,
        data: res.data,
      });
    } else {
      reply.code(400);
    }
  }
);
// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

const updateCheck = setInterval(async function () {
  console.log("check");
  await checkContests();
}, 60_000);

async function checkContests() {
  const contests = await getContests();
  contests.forEach(async (contest) => {
    if (
      !contest.date ||
      (contest.autoUpdate > 5 &&
        Date.now() - contest.autoUpdate * 60 * 1000 > contest.date)
    ) {
      await fetchLeaderbord(contest.contestId);
      const newLog = new Log({
        type: "info",
        message: `${contest.contestId} updated ${new Date().toLocaleString()}`,
      });
      await newLog.save();
      console.log(`${contest.contestId} update ended`);
    }
  });
}
