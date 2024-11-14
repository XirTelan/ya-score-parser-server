export const sessionPostSchema = {
  type: "object",
  required: ["name", "value"],
  properties: {
    name: { type: "string" },
    value: { type: "string" },
  },
};
