import natural from 'natural';
import fs from 'fs';
import he from 'he'; // For decoding HTML entities

const classifier = new natural.BayesClassifier();

// Load the data
const rawData = fs.readFileSync('quiz_questions.json');
const questions = JSON.parse(rawData);

// Preprocess function
function preprocess(text) {
  return he.decode(text).toLowerCase().replace(/[^\w\s]/gi, '');
}

// Add training data to the classifier
questions.forEach(question => {
  const category = question.category === 21 ? 'football' : 'not football'; // 21 is Sports category
  classifier.addDocument(preprocess(question.question), category);
});

// Train the classifier
classifier.train();

// Save the trained classifier
classifier.save('classifier.json', (err) => {
  if (err) {
    console.error('Error saving classifier:', err);
  } else {
    console.log('Classifier saved successfully.');
  }
});