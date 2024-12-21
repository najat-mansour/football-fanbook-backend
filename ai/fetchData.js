import axios from 'axios';
import fs from 'fs';

// Function to introduce a delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch quiz questions
async function fetchQuizQuestions(categoryId, type) {
  const response = await axios.get(`https://opentdb.com/api.php?amount=50&category=${categoryId}&type=${type}`);
  return response.data.results.map(question => ({
    question: question.question,
    category: categoryId
  }));
}

// Fetch multiple categories with delay
async function fetchAllQuestions() {
  const delayDuration = 10000; // 2 seconds delay

  // Fetch football questions
  const footballQuestions = await fetchQuizQuestions(21, 'multiple'); // Sports category
  await delay(delayDuration); // Delay before the next request
  
  // Fetch non-football questions
  const nonFootballQuestions = await fetchQuizQuestions(9, 'multiple'); // General Knowledge category
  
  // Save to a JSON file
  const allQuestions = [...footballQuestions, ...nonFootballQuestions];
  fs.writeFileSync('quiz_questions.json', JSON.stringify(allQuestions, null, 2));
}

// Run the fetch function
fetchAllQuestions();