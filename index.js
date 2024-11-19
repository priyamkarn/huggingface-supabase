const dotenv = require('dotenv');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Function to setup environment file
async function setupEnvironment() {
  const envContent = `
HUGGING_FACE_TOKEN=''
SUPABASE_URL=''
SUPABASE_KEY=''

  try {
    await fs.promises.writeFile('.env', envContent);
    console.log('Created .env file successfully');
  } catch (error) {
    console.error('Error creating .env file:', error);
    process.exit(1);
  }
}

// Load environment variables
function loadEnvironment() {
  const result = dotenv.config();
  if (result.error) {
    console.error('Error loading .env file:', result.error);
    process.exit(1);
  }
}

// Initialize Supabase client
function initializeSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
}

// Test table by inserting and retrieving a record
async function testEmbeddingsTable(supabase) {
  try {
    // Insert a test record
    const testData = {
      text: 'test embedding',
      embedding: Array(384).fill(0)
    };

    const { error: insertError } = await supabase
      .from('embeddings')
      .insert([testData]);

    if (insertError) {
      console.error('Error inserting test record:', insertError);
      return false;
    }

    // Try to retrieve the record
    const { data, error: selectError } = await supabase
      .from('embeddings')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('Error retrieving test record:', selectError);
      return false;
    }

    console.log('Successfully tested embeddings table');
    return true;
  } catch (error) {
    console.error('Error testing embeddings table:', error);
    return false;
  }
}

// Test Supabase connection
async function testSupabaseConnection(supabase) {
  try {
    const tableWorks = await testEmbeddingsTable(supabase);
    if (!tableWorks) {
      throw new Error('Failed to verify embeddings table functionality');
    }

    console.log('Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error.message);
    return false;
  }
}

// Test Hugging Face connection
async function testHuggingFaceConnection() {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        inputs: {
          source_sentence: "Test connection",
          sentences: ["Another test"]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN}`
        }
      }
    );
    console.log('Successfully connected to Hugging Face API');
    return true;
  } catch (error) {
    console.error('Hugging Face API error:', error.response?.data || error.message);
    return false;
  }
}

// Main setup and test function
async function setupAndTest() {
  try {
    await setupEnvironment();
    loadEnvironment();

    const supabase = initializeSupabase();
    
    console.log('\nTesting connections...');
    const [supabaseConnected, huggingFaceConnected] = await Promise.all([
      testSupabaseConnection(supabase),
      testHuggingFaceConnection()
    ]);

    if (supabaseConnected && huggingFaceConnected) {
      console.log('\nAll connections successful! Your environment is ready to use.');
      return true;
    } else {
      console.log('\nSome connections failed. Please check the error messages above.');
      return false;
    }
  } catch (error) {
    console.error('Setup failed:', error);
    return false;
  }
}

// Run setup and tests
if (require.main === module) {
  setupAndTest().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}

module.exports = {
  setupAndTest,
  initializeSupabase,
  testSupabaseConnection,
  testHuggingFaceConnection
};