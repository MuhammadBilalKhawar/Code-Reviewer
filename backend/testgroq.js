import { groq, GROQ_MODEL } from "./utils/groqClient.js";

const completion = await groq.chat.completions.create({
  model: GROQ_MODEL,
  messages: [{ role: "user", content: "Hello, who are you?" }],
});

console.log(completion.choices[0].message.content);
