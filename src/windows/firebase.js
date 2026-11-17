import { doc as webDoc, getDoc as webGetDoc, setDoc, collection, getFirestore as firestore } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import settings from '../../google-services.json';
const client = settings.client[0];
const config = { apiKey: client.api_key[0].current_key, projectId: settings.project_info.project_id,
  appId: client.client_info.mobilesdk_app_id, storageBucket: settings.project_info.storage_bucket };
const app = getApps()[0] || initializeApp(config);
export const getFirestore = () => firestore(app);
export const doc = webDoc;
export const getDoc = async ref => { const snap = await webGetDoc(ref); return { ...snap, exists: snap.exists(), data: () => snap.data() }; };
export { setDoc, collection };
export const getApp = () => app;
export default { app: () => app };
