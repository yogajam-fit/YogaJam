"use client";

import React, { useState, useRef } from "react";

export function ShareArticleButton() {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      setIsSharing(true);
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err: any) {
        // Ignore AbortError (user cancelled) or InvalidStateError (already sharing)
        if (err.name !== 'AbortError' && err.name !== 'InvalidStateError') {
          console.error("Error sharing:", err);
        }
      } finally {
        setIsSharing(false);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <button 
      onClick={handleShare}
      disabled={isSharing}
      className="flex items-center gap-2 text-accent font-medium hover:text-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Share this article"
    >
      {copied ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline">Link Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="hidden sm:inline">Share Article</span>
        </>
      )}
    </button>
  );
}
