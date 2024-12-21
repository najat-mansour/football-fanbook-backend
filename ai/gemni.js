import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMNI_API_KEY);

export const generateNewQuestionUsingGemni = async (quiz) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    `Avoiding the replication on of the following questions: ${JSON.stringify(quiz)}. 
    Give me an MCQ question about famous football information in format:
    {"question": "", "options": ["", "", "", ""], "correctOption": }
    without any spaces between the fields, they are allowed between the option words.
    where correctOption contains the index [1-4] of the correct option.
    `
  ]);

  const textResponse = result.response.text();
  return JSON.parse(textResponse);
}

export const validateQuizUsingGemni = async (quiz) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    `Answer in this format {"resultCode": , "reason": ""}
    without any spaces between the fields, they are allowed in reason field.
    Does the following questions related to football and all the questions are answered correctly?${JSON.stringify(quiz)}
    where correctOption contains the index [1-4] of the correct option.
    where resultCode must be 0 for failed and 1 for success, 
    and the reason must be which question is not related to football or answered incorrectly
    `
  ]);

  const textResponse = result.response.text();
  return JSON.parse(textResponse);
};