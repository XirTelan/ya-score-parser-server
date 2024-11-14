import Config from "../models/Config";

export async function getSession() {
  const res = await Config.findOne({ name: "sessionId" }).lean();
  return res;
}

export async function updateSession(newValue: string) {
  try {
    const res = await Config.findOne({ name: "sessionId" });
    if (!res) {
      const newEntry = new Config({
        name: "sessionId",
        value: "newValue",
      });
      await newEntry.save();
    } else {
      res.value = newValue;
      await res.save();
    }
    return res;
  } catch (error) {
    console.error(error);
  }
}
