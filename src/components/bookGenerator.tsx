// bookGenerator.tsx

// Helper function to pick a random element from an array
const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Arrays of parts of speech for title generation
const adjectives: string[] = ["Unseen", "Forgotten", "Mystic", "Eternal", "Hidden"];
const nouns: string[] = ["Journey", "Empire", "Secret", "Legacy", "Destiny"];

// Arrays of famous author first names and last names for author generation
const authorFirstNames: string[] = ["James", "Mary", "John", "Patricia", "Robert"];
const authorLastNames: string[] = ["Smith", "Johnson", "Williams", "Brown", "Jones"];

// Generate a list of random book titles
export const generateTitles = (numTitles: number = 10): string[] => {
    return Array.from({ length: numTitles }, () => `${pickRandom(adjectives)} ${pickRandom(nouns)}`);
};

// Generate a list of random author names
export const generateAuthors = (numAuthors: number = 10): string[] => {
    return Array.from({ length: numAuthors }, () => `${pickRandom(authorFirstNames)} ${pickRandom(authorLastNames)}`);
};

export default { generateTitles, generateAuthors };
