import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

let model: use.UniversalSentenceEncoder | null = null;

// Initialize the TensorFlow.js model
export const initializeModel = async (): Promise<void> => {
  if (!model) {
    try {
      // Load the Universal Sentence Encoder model
      model = await use.load();
      console.log('TensorFlow.js model loaded successfully');
    } catch (error) {
      console.error('Failed to load TensorFlow.js model:', error);
      throw new Error('Failed to load essay scoring model');
    }
  }
};

// Calculate coherence score based on sentence embeddings similarity
const calculateCoherence = async (sentences: string[]): Promise<number> => {
  if (!model || sentences.length < 2) {
    return 0;
  }

  // Get embeddings for all sentences
  const embeddings = await model.embed(sentences);
  
  // Calculate cosine similarity between adjacent sentences
  let totalSimilarity = 0;
  
  for (let i = 0; i < sentences.length - 1; i++) {
    const embedding1 = embeddings.slice([i, 0], [1, -1]);
    const embedding2 = embeddings.slice([i + 1, 0], [1, -1]);
    
    // Calculate cosine similarity
    const dotProduct = tf.matMul(embedding1, embedding2, false, true);
    const norm1 = tf.norm(embedding1);
    const norm2 = tf.norm(embedding2);
    
    const similarity = dotProduct.div(norm1.mul(norm2));
    totalSimilarity += similarity.dataSync()[0];
    
    // Clean up tensors
    tf.dispose([dotProduct, norm1, norm2]);
  }
  
  // Clean up embeddings tensor
  embeddings.dispose();
  
  // Return average similarity (0-1 scale)
  return totalSimilarity / (sentences.length - 1);
};

// Simple grammar check (in a real app, this would be more sophisticated)
const calculateGrammarScore = (text: string): number => {
  // Count common grammar issues (simplified for demo)
  const issues = [
    /\s+,/g,                    // Space before comma
    /\s+\./g,                   // Space before period
    /\b(i)\b/g,                 // Lowercase 'i' as pronoun
    /\b(dont|cant|wont)\b/gi,   // Missing apostrophes
    /\b(their|there|they're)\b/gi, // Common confusions (simplified check)
    /\b(your|you're)\b/gi,      // Common confusions (simplified check)
    /\b(its|it's)\b/gi,         // Common confusions (simplified check)
    /\s{2,}/g,                  // Multiple spaces
  ];
  
  let issueCount = 0;
  issues.forEach(regex => {
    const matches = text.match(regex);
    if (matches) {
      issueCount += matches.length;
    }
  });
  
  // Calculate words per sentence (too long sentences can be an issue)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // Penalize for very long sentences (more than 25 words on average)
  if (avgWordsPerSentence > 25) {
    issueCount += Math.floor((avgWordsPerSentence - 25) / 5);
  }
  
  // Calculate score (0-1 scale, where 1 is perfect)
  const normalizedIssueRate = Math.min(issueCount / (words.length * 0.1), 1);
  return 1 - normalizedIssueRate;
};

// Evaluate essay structure (introduction, body, conclusion)
const calculateStructureScore = (text: string): number => {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  if (paragraphs.length < 3) {
    // Too few paragraphs for a proper structure
    return 0.5;
  }
  
  // Check if first paragraph looks like an introduction
  const hasIntro = paragraphs[0].length > 50 && 
                  (paragraphs[0].includes('introduction') || 
                   paragraphs[0].includes('introduce') || 
                   paragraphs[0].includes('topic') ||
                   paragraphs[0].includes('discuss'));
  
  // Check if last paragraph looks like a conclusion
  const hasConclusion = paragraphs[paragraphs.length - 1].length > 50 && 
                       (paragraphs[paragraphs.length - 1].includes('conclusion') || 
                        paragraphs[paragraphs.length - 1].includes('conclude') || 
                        paragraphs[paragraphs.length - 1].includes('summary') ||
                        paragraphs[paragraphs.length - 1].includes('therefore') ||
                        paragraphs[paragraphs.length - 1].includes('in summary'));
  
  // Check if body paragraphs have topic sentences
  let bodyScore = 0;
  for (let i = 1; i < paragraphs.length - 1; i++) {
    const firstSentence = paragraphs[i].split(/[.!?]/).filter(s => s.trim().length > 0)[0] || '';
    if (firstSentence.length > 20) {
      bodyScore += 1;
    }
  }
  
  bodyScore = bodyScore / (paragraphs.length - 2);
  
  // Calculate overall structure score
  return (hasIntro ? 0.3 : 0) + (hasConclusion ? 0.3 : 0) + (bodyScore * 0.4);
};

// Generate feedback based on scores
const generateFeedback = (coherence: number, grammar: number, structure: number): string => {
  let feedback = '';
  
  // Coherence feedback
  if (coherence < 0.6) {
    feedback += 'Your essay lacks coherence. Try to improve the flow between sentences and paragraphs. Make sure your ideas connect logically. ';
  } else if (coherence < 0.8) {
    feedback += 'Your essay has decent coherence, but some transitions between ideas could be smoother. ';
  } else {
    feedback += 'Your essay demonstrates excellent coherence with smooth transitions between ideas. ';
  }
  
  // Grammar feedback
  if (grammar < 0.6) {
    feedback += 'There are significant grammar issues that need attention. Consider reviewing basic grammar rules and proofreading carefully. ';
  } else if (grammar < 0.8) {
    feedback += 'There are some grammar issues that could be improved. A thorough proofreading would help. ';
  } else {
    feedback += 'Your grammar is generally strong with few errors. ';
  }
  
  // Structure feedback
  if (structure < 0.6) {
    feedback += 'The essay structure needs improvement. Ensure you have a clear introduction, well-developed body paragraphs, and a conclusion that summarizes your main points.';
  } else if (structure < 0.8) {
    feedback += 'Your essay structure is adequate but could be strengthened. Make sure each paragraph has a clear purpose and connects to your thesis.';
  } else {
    feedback += 'Your essay has an excellent structure with a clear introduction, well-developed body paragraphs, and a strong conclusion.';
  }
  
  return feedback;
};

// Score an essay
export const scoreEssay = async (essayText: string): Promise<{
  overall: number;
  coherence: number;
  grammar: number;
  structure: number;
  feedback: string;
}> => {
  if (!model) {
    await initializeModel();
  }
  
  // Split text into sentences for coherence analysis
  const sentences = essayText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Calculate individual scores
  const coherence = await calculateCoherence(sentences);
  const grammar = calculateGrammarScore(essayText);
  const structure = calculateStructureScore(essayText);
  
  // Calculate overall score (weighted average)
  const overall = (coherence * 0.4) + (grammar * 0.3) + (structure * 0.3);
  
  // Generate feedback
  const feedback = generateFeedback(coherence, grammar, structure);
  
  return {
    overall: parseFloat(overall.toFixed(2)),
    coherence: parseFloat(coherence.toFixed(2)),
    grammar: parseFloat(grammar.toFixed(2)),
    structure: parseFloat(structure.toFixed(2)),
    feedback
  };
};