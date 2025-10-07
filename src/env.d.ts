/// <reference types="astro/client" />

interface Window {
    initializeGA?: () => void;
    gaInitialized?: boolean;
}