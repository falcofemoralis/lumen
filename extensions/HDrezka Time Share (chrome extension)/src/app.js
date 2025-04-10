const getFormattedDate = () => {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

const getDocumentId = (data) => {
    if (!data.userId || data.userId == '0') {
        throw Error("unauthorized")
    }
    return `${data.userId}-${data.titleId}-${data.voiceId}-${data.season ? data.season : undefined}-${data.episode ? data.episode : undefined}`
};

const getDeviceId = () => {
    let id = localStorage.getItem('DEVICE_ID');

    if (!id) {
        id = Date.now();
        localStorage.setItem('DEVICE_ID', id);
    }

    return id;
}

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const handleFromWeb = async (event) => {
    if (event.data.action) {
        if (event.data.action == 'get') {
            try {
                if (event.data.data.titleId) {
                    const data = (await db.collection(DB_COLLECTION).doc(getDocumentId(event.data.data)).get()).data();
                    if (data && getDeviceId() != data.deviceId) {
                        window.postMessage({ action: 'seek', data: { time: data.timestamp } })
                    }
                }
            } catch (error) {
                console.log(error);
            }

            window.postMessage({ action: 'fetched' })
        } else if (event.data.action == 'update') {
            const { time } = event.data.data

            if (time > 0) {
                db.collection(DB_COLLECTION).doc(getDocumentId(event.data.data)).set({
                    deviceId: getDeviceId(),
                    timestamp: time,
                    updateAt: getFormattedDate()
                })
            }
        }
    }
};

window.addEventListener('message', handleFromWeb);