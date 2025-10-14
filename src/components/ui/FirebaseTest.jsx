"use client";
import { useState } from "react";
import { db } from "@/lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function FirebaseTest() {
  const [status, setStatus] = useState("idle");

  const writeDoc = async () => {
    try {
      setStatus("writing...");
      const ref = await addDoc(collection(db, "makanbot_test"), {
        createdAt: serverTimestamp(),
        note: "hello from Next.js",
      });
      setStatus(`wrote doc ${ref.id}`);
    } catch (e) {
      setStatus(`error: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={writeDoc}
          className="px-3 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm"
        >
          Write Firestore Doc
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-300">{status}</span>
      </div>
    </div>
  );
}


