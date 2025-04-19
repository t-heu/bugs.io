import * as firebase from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  onValue, 
  update, 
  get, 
  child, 
  onDisconnect, 
  remove, 
  push, 
  query, 
  orderByChild, 
  equalTo 
} from "firebase/database";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
};

const app = firebase.initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app)

export { 
  firebase, 
  database, 
  ref, 
  set, 
  onValue, 
  update, 
  get, 
  child, 
  onDisconnect, 
  remove, 
  push, 
  query, 
  orderByChild, 
  equalTo,
  auth
};
