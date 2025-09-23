import { writable, derived } from 'svelte/store';

function getInitial() {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable(getInitial());

theme.subscribe(value => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value);
        document.documentElement.setAttribute('data-theme', value);
    }
});

function defaultPalette(theme) {
    return {
        '--bg': theme === 'dark' ? '#414244ff' : '#ffffff',
        '--bg2': theme === 'dark' ? '#616161ff' : '#e9e9e9ff',
        '--fg': theme === 'dark' ? '#f0f0f0ff' : '#000000',
        '--primary': theme === 'dark' ? '#90f9b3ff' : '#1fda4dff',
        '--on-primary': theme === 'dark' ? '#000000ff' : '#ffffff',
        '--primary-hover': theme === 'dark' ? '#76e1a1ff' : '#1fda4dff',
        '--secondary': theme === 'dark' ? '#ff7ca8ff' : '#ff76a8ff',
        '--accent': theme === 'dark' ? '#c975d8ff' : '#dc7cf7ff',
        '--muted': theme === 'dark' ? '#8f8f8fff' : '#aaaaaaff',
        '--dots': theme === 'dark' ? '#5a5a5aff' : '#dfdfdfff',
        '--border': theme === 'dark' ? '#ecececff' : '#bdbdbdff',
        '--blue': theme === 'dark' ? '#3b86e0ff' : '#a2c0ecff',
        '--red': theme === 'dark' ? '#ec5050ff' : '#ee8b8bff',
        '--green': theme === 'dark' ? '#10be10ff' : '#a9f3a9ff',
        '--magenta': theme === 'dark' ? '#d65cd6ff' : '#f58af5ff',
    }
}

export const palette = derived(theme, ($theme) => defaultPalette($theme));