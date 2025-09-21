firebase.initializeApp(firebaseConfig);
const firestoreDb = firebase.firestore().collection(DB_COLLECTION);

const getFormattedDate = () => {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = now.getFullYear();

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const safeJsonParse = (str, fallback) => {
  if (!str) {
    return fallback ?? null;
  }

  try {
    return JSON.parse(str);
  } catch {
    return fallback ?? null;
  }
};

const getDeviceId = () => {
  let id = localStorage.getItem('DEVICE_ID');

  if (!id) {
    id = Date.now();
    localStorage.setItem('DEVICE_ID', id);
  }

  return id;
};

const formatPlayerKeyTime = (data) => {
  return `playerTime-${data.titleId}`;
};

const formatFirestoreKey = (data) => {
  return `${formatPlayerKeyTime(data)}-${data.userId}`;
};

const formatTimestampKey = (data) => {
  if (!data.season || !data.episode) {
    return '0';
  }

  return `${data.season}-${data.episode}`;
};

const prepareSavedTimeObject = (
  data,
  time,
  progress,
  previousSavedTime
) => {
  const newSavedTime = previousSavedTime
    ? { ...previousSavedTime }
    : { filmId: data.titleId, voices: {} };

  const voiceData = newSavedTime.voices[data.voiceId ?? ''] ?? {};

  if (!voiceData.timestamps) {
    voiceData.timestamps = {};
  }

  voiceData.timestamps[formatTimestampKey(data)] = {
    time,
    progress,
    deviceId: getDeviceId(),
  };

  newSavedTime.voices[data.voiceId] = voiceData;

  return newSavedTime;
};

const updateFirestoreSavedTime = async (
  data,
  time,
  progress
) => {
  const key = formatFirestoreKey(data);

  const doc = await firestoreDb.doc(key).get();
  const docData = doc.data();

  const prevSavedTime = safeJsonParse(docData?.savedTime, null);
  const newSavedTime = prepareSavedTimeObject(data, time, progress, prevSavedTime);

  firestoreDb
    .doc(key)
    .set({
      savedTime: JSON.stringify(newSavedTime),
      updatedAt: getFormattedDate(),
    });
};

const getFirestoreSavedTime = async (data) => {
  const key = formatFirestoreKey(data);
  const doc = await firestoreDb.doc(key) .get();
  const docData = doc.data();

  if (!data) {
    return null;
  }

  const timestamp = safeJsonParse(docData?.savedTime, null);

  return timestamp;
};

const getVideoTime = (data, savedTime) => {
  if (!savedTime) {
    return 0;
  }

  const voiceData = savedTime.voices[data.voiceId ?? ''];

  if (!voiceData || !voiceData.timestamps) {
    return 0;
  }

  return voiceData.timestamps[formatTimestampKey(data)]?.time ?? 0;
};

const handleFromWeb = async (event) => {
  if (event.data.action) {
    if (event.data.action == 'get') {
      try {
        if (event.data.data.titleId) {
          const firestoreSavedTime = await getFirestoreSavedTime(event.data.data);
          const time = getVideoTime(event.data.data, firestoreSavedTime);

          if (time) {
            window.postMessage({ action: 'seek', data: { time } });
          }
        }
      } catch (error) {
        console.error(error);
      }

      window.postMessage({ action: 'fetched' });
    } else if (event.data.action == 'update') {
      const { time } = event.data.data;

      if (time > 0) {
        const data = event.data.data;
        updateFirestoreSavedTime(data, time, (data.time / data.duration) * 100);
      }
    }
  }
};

window.addEventListener('message', handleFromWeb);