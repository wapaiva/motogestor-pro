import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";

// Reuse the already initialized firebase app
const firebaseConfig = {
  apiKey: "AIzaSyDLTIg4thT1qW-BxhyKUI8Z7EaBEzQBEGA",
  authDomain: "motogestor-pro.firebaseapp.com",
  projectId: "motogestor-pro",
  storageBucket: "motogestor-pro.firebasestorage.app",
  messagingSenderId: "695841834318",
  appId: "1:695841834318:web:a3b3f8484f3dbc7a530a1f",
  measurementId: "G-C2PLRVLYBT",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function uploadAvatar(userId: string, file: Blob): Promise<string> {
  const r = ref(storage, `avatars/${userId}/avatar.jpg`);
  await uploadBytes(r, file, { contentType: file.type || "image/jpeg" });
  return getDownloadURL(r);
}

export async function deleteAvatar(userId: string): Promise<void> {
  const r = ref(storage, `avatars/${userId}/avatar.jpg`);
  try {
    await deleteObject(r);
  } catch (err: any) {
    if (err?.code !== "storage/object-not-found") throw err;
  }
}

/**
 * Compress an image file to a max dimension and JPEG quality.
 */
export async function compressImage(file: File | Blob, maxSize = 512, quality = 0.85): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = dataUrl;
  });
  const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", quality);
  });
}
