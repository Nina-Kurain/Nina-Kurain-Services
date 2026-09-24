import type { StudioProjectDraft } from "./editor-types";

const DB_NAME = "nina_studio_editor_db";
const DB_VERSION = 1;
const STORE_NAME = "project_drafts";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this browser"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("lastSavedAt", "lastSavedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

/**
 * Save draft to local IndexedDB.
 */
export async function saveDraftToIndexedDB(draft: StudioProjectDraft): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      // Clean non-serializable properties if any (URLs can be re-created from blobs/files)
      const cleanDraft = {
        ...draft,
        lastSavedAt: Date.now(),
        items: draft.items.map((item) => ({
          ...item,
          // sourceUrl can become invalid across reloads, we preserve the File/Blob for recreation
          sourceUrl: item.file ? "" : item.sourceUrl,
          renderedUrl: "",
          coverUrl: "",
        })),
      };

      const req = store.put(cleanDraft);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not save draft:", err);
  }
}

/**
 * Get latest unsaved draft.
 */
export async function getLatestDraftFromIndexedDB(): Promise<StudioProjectDraft | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("lastSavedAt");
      const req = index.openCursor(null, "prev"); // newest first

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          const draft = cursor.value as StudioProjectDraft;
          // Re-hydrate object URLs from files/blobs
          draft.items = draft.items.map((item) => {
            let url = item.sourceUrl;
            if (item.file && (!url || url.startsWith("blob:"))) {
              url = URL.createObjectURL(item.file);
            }
            return {
              ...item,
              sourceUrl: url,
            };
          });
          resolve(draft);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not retrieve draft:", err);
    return null;
  }
}

/**
 * Delete a specific project draft.
 */
export async function deleteDraftFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not delete draft:", err);
  }
}

/**
 * Clear all drafts.
 */
export async function clearAllDraftsFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[IndexedDB] Could not clear drafts:", err);
  }
}
