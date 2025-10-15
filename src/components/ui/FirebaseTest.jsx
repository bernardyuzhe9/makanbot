"use client";
import { useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { signInAnonymously } from "firebase/auth";

export default function FirebaseTest() {
  const [status, setStatus] = useState("idle");

  const testAuth = async () => {
    try {
      setStatus("signing in...");
      const cred = await signInAnonymously(auth);
      setStatus(`signed in: ${cred.user.uid}`);
    } catch (e) {
      setStatus(`error: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={testAuth}
          className="px-3 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm"
        >
          Test Firebase Auth
        </button>
        <span className="text-sm text-neutral-600 dark:text-neutral-300">{status}</span>
      </div>
    </div>
  );
}


