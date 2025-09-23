import { palette } from './theme.js';

let unsubscribe = null;

// startPaletteInjection subscribes to the palette store and applies the colors as CSS variables
export function startPaletteInjection() {
    if (unsubscribe) return; // already started
    unsubscribe = palette.subscribe(p => {
        for (const [key, value] of Object.entries(p)) {
            document.documentElement.style.setProperty(key, value);
        }
    });
}

// stopPaletteInjection unsubscribes from the palette store
export function stopPaletteInjection() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }
}