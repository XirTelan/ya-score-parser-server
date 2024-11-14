import Log from "../models/Log";
import Rating from "../models/Rating";
import { DataEntry } from "../types";

export const updateRating = async (data: DataEntry[], contestId: string) => {
  if (data.length === 0) {
    const newLog = new Log({
      type: "warning",
      message: "Recive 0 entries from leaderboard update.Check  Session_Id  ",
    });
    await newLog.save();
  }
  const queue = [];
  for (const user of data) {
    const filter = { userId: user.id, contestId: contestId };
    const update = {
      tasks: user.tasks || 0,
      fine: user.fine || 0,
      tries: user.tries || 0,
    };
    queue.push(
      Rating.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
      })
    );
  }
  const res = await Promise.all(queue);
};
