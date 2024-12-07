import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA52cd_kxWjJdWr6qitJVJeOPEUUFB-gWA",
  authDomain: "github-ai-ababd.firebaseapp.com",
  projectId: "github-ai-ababd",
  storageBucket: "github-ai-ababd.firebasestorage.app",
  messagingSenderId: "770867518481",
  appId: "1:770867518481:web:969e5b96d7f71c43fda5b0"
};

const app = initializeApp(firebaseConfig);
export const storage  = getStorage(app);

export async function uploadFile(file: File, setProgress?: (progress: number) => void) {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on('state_changed', (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if(setProgress) setProgress(progress);
                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            }, error => {
                reject(error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            });
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}