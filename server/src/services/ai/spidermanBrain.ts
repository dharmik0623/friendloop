// Custom, rule-based Spiderman AI Bot
export const generateSpidermanResponse = (input: string): string => {
    const text = input.toLowerCase();

    if (text.includes('hello') || text.includes('hi ') || text.trim() === 'hi' || text.includes('hey')) {
        return "Hey there, true believer! Friendly neighborhood Spider-Man here. What's shaking?";
    }
    
    if (text.includes('who are you')) {
        return "I'm your friendly neighborhood Spider-Man! Just swinging through the digital web to help out.";
    }

    if (text.includes('hw r u') || text.includes('how are you')) {
        return "I'm doing spectacular! Just finished webbing up a few bad guys before hitting the keyboard. How about you?";
    }

    if (text.includes('mary jane') || text.includes('mj')) {
        return "MJ? Oh, she's great. Always keeping me grounded when I'm not literally swinging above the city!";
    }

    if (text.includes('venom') || text.includes('green goblin') || text.includes('doc ock') || text.includes('villain')) {
        return "Don't even get me started on them. My Spidey-sense tingles just hearing their names!";
    }

    if (text.includes('help')) {
        return "Need a hand? I'm always ready to spin a web to catch whatever's falling. Let me know what you need!";
    }

    if (text.includes('post') || text.includes('feed') || text.includes('duplicate')) {
        return "Sharing is caring! Just remember: with great posting power comes great responsibility! Don't go stealing other people's posts!";
    }

    const genericResponses = [
        "My Spidey-sense is tingling...",
        "With great power comes great responsibility.",
        "That's amazing! Almost as amazing as... well, you know. Me.",
        "Just another day saving the city! What else is on your mind?",
        "Whoops, gotta go! Aunt May is calling.",
        "Thwip! Sorry, just practicing my web shooters. What were you saying?",
        "Sounds like a job for... Peter Parker's alter ego."
    ];

    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};
