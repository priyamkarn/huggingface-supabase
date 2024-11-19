const axios = require('axios');

// Your Hugging Face API key (replace with your actual key)
const API_KEY = 'api key';

// Function to get embeddings and similarities from Hugging Face
async function getEmbeddings(texts) {
  const url = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2';

  try {
    const response = await axios.post(url, {
      inputs: {
        source_sentence: texts[0],
        sentences: texts.slice(1)
      }
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error getting embeddings from Hugging Face:', 
      error.response?.data || error.message);
    throw error;
  }
}

// Function to make a query and check similarity
async function querySimilarity(query, compareTexts) {
  try {
    const allTexts = [query, ...compareTexts];
    const similarities = await getEmbeddings(allTexts);

    // Format and display results
    console.log('\n=== Similarity Results ===');
    console.log(`Query: "${query}"\n`);
    
    compareTexts.forEach((text, index) => {
      const similarityScore = similarities[index];
      const percentage = (similarityScore * 100).toFixed(2);
      console.log(`Compared to: "${text}"`);
      console.log(`Similarity: ${percentage}%\n`);
    });

  } catch (error) {
    console.error('Failed to get similarity scores:', error);
  }
}

// Example usage
async function main() {
  // Test set 1: Original examples
  const texts = [
    "Hello world",
    "Machine learning is fascinating",
    "PGVector is a great extension for PostgreSQL"
  ];

  console.log('Test Set 1: Original Examples');
  await querySimilarity(texts[0], texts.slice(1));

  // Test set 2: More related sentences
  const relatedTexts = [
    "What is machine learning?",
    "Machine learning is AI technology",
    "Deep learning is a subset of machine learning",
    "Natural language processing uses machine learning"
  ];

  console.log('\nTest Set 2: Machine Learning Related Sentences');
  await querySimilarity(relatedTexts[0], relatedTexts.slice(1));
}

main();