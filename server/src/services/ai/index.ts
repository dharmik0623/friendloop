// Mock AI Content Moderation Service
export const moderatelySafe = async (content: string): Promise<boolean> => {
    // In a real scenario, this would call an LLM API (like OpenAI) 
    // to classify if the content contains hate speech, spam, etc.
    console.log(`[AI Moderation] Analyzing content: "${content.substring(0, 30)}..."`);
    
    // Improved moderation logic with more categories
    const blockedKeywords = [
        'spam', 'hate', 'violence', 'scam', 'offensive', 
        'abuse', 'threat', 'illegal', 'malware'
    ];
    
    const text = content.toLowerCase();
    
    // Check for explicit keywords
    for (const word of blockedKeywords) {
        if (text.includes(word)) {
            console.log(`[AI Moderation] Blocked keyword found: ${word}`);
            return false;
        }
    }

    // Simple pattern check for common spam/scam patterns
    const spamPatterns = [
        /\$\d+/, // Price tags
        /win.*prize/i,
        /click.*here/i,
        /free.*money/i
    ];

    if (spamPatterns.some(pattern => pattern.test(text))) {
        console.log(`[AI Moderation] Spam pattern detected`);
        return false;
    }
    
    return true; // Safe
};
