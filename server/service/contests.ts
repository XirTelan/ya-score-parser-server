import Contest from "../models/Contest";
import Log from "../models/Log";
import { ContestDTO } from "../types";

export async function getContests() {
  const res = await Contest.find({}, { "stats._id": 0 }).lean();
  return res;
}
export async function getContestById(id: string): Promise<ContestDTO | null> {
  const res = await Contest.findOne({ contestId: id }).lean();
  return res as ContestDTO | null;
}
export async function deleteContest(id: string) {
  const res = await Contest.findByIdAndDelete(id);
  return res;
}
export async function updateStat(id: string, data: Partial<ContestDTO>) {
  const res = await Contest.findOneAndUpdate(
    {
      contestId: id,
    },
    data
  );
}
export async function updateContests(data: ContestDTO[]) {
  const queue = [];
  try {
    for (const contest of data) {
      const { _id, ...rest } = contest;
      if (_id) {
        const current = await Contest.findByIdAndUpdate(_id, rest, {
          upsert: true,
        });
      } else {
        const newContest = new Contest(rest);
        await newContest.save();
      }
    }
    return { success: true };
  } catch (error) {
    const newLog = new Log({
      message: `${error}`,
      type: "error",
    });
    await newLog.save();
    console.error(error);
  }
}
