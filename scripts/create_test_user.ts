import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');

let supabaseUrl = '';
let supabaseAnonKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value;
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value;
        }
    });
} catch (error) {
    console.error('Error reading .env.local:', error);
    process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseAnonKey.length);

async function createTestUser() {
    const email = 'test@example.com';
    const password = 'password123';

    console.log(`Attempting to sign up user: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Admin User',
                role: 'admin'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created/invited successfully.');
        console.log('ID:', data.user?.id);
        console.log('Email:', data.user?.email);
        console.log('Role:', data.user?.role);
        if (data.session) {
            console.log('Session active!');
        } else {
            console.log('Session not active. Email confirmation might be required.');
        }
    }
}

createTestUser();
