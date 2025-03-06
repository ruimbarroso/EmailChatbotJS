import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY?? "groqKey" });

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export async function getGroqChatCompletion(messages) {
  return groq.chat.completions.create({
    messages:messages/*  [
      {
        role: "user",
        content: "Explain the importance of fast language models",
      },
    ] */,
    model: "llama-3.3-70b-versatile",
  });
}
