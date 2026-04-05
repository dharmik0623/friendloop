import { generateSpidermanResponse } from './src/services/ai/spidermanBrain';

console.log("Testing Spidey Brain!");
console.log("----------------------");
console.log("Input: 'hello there'");
console.log("Spidey: ", generateSpidermanResponse('hello there'));

console.log("\nInput: 'who are you?'");
console.log("Spidey: ", generateSpidermanResponse('who are you?'));

console.log("\nInput: 'wow venom is crazy'");
console.log("Spidey: ", generateSpidermanResponse('wow venom is crazy'));

console.log("\nInput: 'i am going to post this duplicate'");
console.log("Spidey: ", generateSpidermanResponse('i am going to post this duplicate'));

console.log("\nInput: 'just a regular generic message'");
console.log("Spidey: ", generateSpidermanResponse('just a regular generic message'));
