import natural from 'natural';
import he from 'he'; // For decoding HTML entities

// Load the trained classifier
natural.BayesClassifier.load('classifier.json', null, (err, classifier) => {
  if (err) {
    console.error('Error loading classifier:', err);
    return;
  }

  // Preprocess function
  function preprocess(text) {
    return he.decode(text).toLowerCase().replace(/[^\w\s]/gi, '');
  }

  // Classify new text
  function classifyQuiz(text) {
    return classifier.classify(preprocess(text));
  }

  const quizText = 'What is the conditional operator in js?';
  const result = classifyQuiz(quizText);
  console.log(result); // Should output 'not football'
});