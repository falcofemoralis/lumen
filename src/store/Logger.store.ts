import { getFirestore } from '@react-native-firebase/firestore';
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { MMKV } from 'react-native-mmkv';
import { ProfileInterface } from 'Type/Profile.interface';
import { getFormattedDate } from 'Util/Date';
import { safeJsonParse } from 'Util/Json';

import ConfigStore from './Config.store';
import StorageStore from './Storage.store';

export interface LogEntry {
  type: 'debug' | 'error';
  timestamp: string;
  message: string;
  context?: Record<string, any>;
}

interface FirestoreDocument {
  data: string;
  deviceInfo: string;
  timestamp: string;
}

class Logger {
  private storage: MMKV | null = null;
  private logKey: string = 'debug';
  private maxLogs: number = 500;

  private initLogger() {
    this.storage = StorageStore.getDebugStorage();
  }

  private getLogs(): LogEntry[] {
    const raw = this.storage?.getString(this.logKey);

    return raw ? JSON.parse(raw) : [];
  }

  private saveLogs(logs: LogEntry[]) {
    this.storage?.set(this.logKey, JSON.stringify(logs.slice(-this.maxLogs)));
  }

  private addLog(log: LogEntry) {
    const logs = this.getLogs();
    logs.push(log);
    this.saveLogs(logs);
  }

  private publishLog(type: 'debug' | 'error', message: string, context?: Record<string, any>) {
    if (!ConfigStore.getConfig().loggerEnabled) {
      return;
    }

    if (!this.storage) {
      this.initLogger();
    }

    this.addLog({
      type,
      timestamp: new Date().toISOString(),
      message,
      context,
    });

    if (type === 'error') {
      console.error(message, context);
    } else if (type === 'debug') {
      console.debug(message, context);
    }
  }

  debug(msg: string, ctx?: Record<string, any>) {
    this.publishLog('debug', msg, ctx);
  }

  error(msg: string, ctx?: Record<string, any>) {
    if (ctx && ctx.error) {
      ctx.error = ctx.error instanceof Error ? ctx.error.message : ctx.error;
    }

    this.publishLog('error', msg, ctx);
  }

  clear() {
    this.storage?.delete(this.logKey);
  }

  getAll() {
    return this.getLogs().reverse();
  }

  async send() {
    const firestoreDb = getFirestore().collection<FirestoreDocument>('logs');

    const data = this.storage?.getString(this.logKey);

    if (!data) {
      return;
    }

    const profile = safeJsonParse<ProfileInterface>(StorageStore.getMiscStorage().getString('PROFILE_STORAGE'));

    const deviceInfo = {
      isLoggedIn: !!profile?.id,
      userId: profile?.id,
      isTV: ConfigStore.isTV(),
      osVersion: Device.osVersion,
      totalMemory: Device.totalMemory,
      appVersion: Application.nativeApplicationVersion ?? '0.0.0',
    };

    await firestoreDb.doc(`${ConfigStore.getDeviceId(true)}-${Date.now()}`).set({
      data,
      deviceInfo: JSON.stringify(deviceInfo),
      timestamp: getFormattedDate(),
    });

    this.clear();
  }
}

export default new Logger();