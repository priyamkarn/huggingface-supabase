run on supabase sql editor
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
