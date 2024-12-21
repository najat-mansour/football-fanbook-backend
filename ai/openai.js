const apiKey = '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'; // Replace with your OpenAI API key
const prompt = "Translate the following English text to French: 'Hello, how are you?'";

fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or another model, such as 'gpt-3.5-turbo'
        prompt: prompt,
        max_tokens: 50
    })
})
.then(response => response.json())
.then(data => {
    console.log(data); // Print the response text
})
.catch(error => {
    console.error('Error:', error);
});