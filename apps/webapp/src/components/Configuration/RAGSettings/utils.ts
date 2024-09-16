export const vectorDatabases = [
    { name: "Pinecone", logoPath: "/rag/pinecone.png", description: "Pinecone vector database" },
    { name: "Qdrant", logoPath: "/rag/qdrant.png", description: "Qdrant vector database" },
    { name: "Weaviate", logoPath: "/rag/weaviate.webp", description: "Weaviate vector database" },
    { name: "Chromadb", logoPath: "/rag/chroma.webp", description: "ChromaDB vector database" },
    { name: "Turbopuffer", logoPath: "/rag/turbopuffer.png", description: "TurboPuffer vector database" },
];
  
export const embeddingModels = [
    { name: "OPENAI_ADA_SMALL_1536", logoPath: "/rag/openai.png", description: "OpenAI - text-embedding-3-small" },
    { name: "OPENAI_ADA_LARGE_3072", logoPath: "/rag/openai.png", description: "OpenAI - text-embedding-3-large" },
    { name: "OPENAI_ADA_002", logoPath: "/rag/openai.png", description: "OpenAI - text-embedding-ada-002" },
    { name: "COHERE_MULTILINGUAL_V3", logoPath: "/rag/cohere.jpeg", description: "Cohere - embed-multilingual-v3.0" },
];
  
export type TabType = "vectorDatabase" | "embeddingModel";
  