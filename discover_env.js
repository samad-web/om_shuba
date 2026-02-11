
import * as dotenv from 'dotenv';
dotenv.config();

console.log('--- VITE ENVIRONMENT VARIABLES ---');
Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_')) {
        console.log(`${key}=${process.env[key]}`);
    }
});
