import env from "@/app/env";
import { Avatars, Client, Databases, Storage, Users } from "node-appwrite";

const client = new Client();

console.log('🔍 Server config - Environment variables:', {
  endpoint: env.appwrite.endpoint,
  projectId: env.appwrite.projectId,
  apiKeySet: !!env.appwrite.apikey,
  apiKeyLength: env.appwrite.apikey?.length || 0
});

// Validate environment variables
if (!env.appwrite.endpoint) {
  throw new Error('NEXT_PUBLIC_APPWRITE_HOST_URL is not set');
}

if (!env.appwrite.projectId) {
  throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
}

if (!env.appwrite.apikey) {
  throw new Error('APPWRITE_API_KEY is not set');
}

client
  .setEndpoint(env.appwrite.endpoint)
  .setProject(env.appwrite.projectId)
  .setKey(env.appwrite.apikey);

const databases = new Databases(client);
const avatars = new Avatars(client);
const storage = new Storage(client);
const users = new Users(client);

export { client, databases, users, avatars, storage };
