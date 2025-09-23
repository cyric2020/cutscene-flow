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
    if (theme === 'dark') {
        return {
            '--bg': '#414244ff',
            '--bg2': '#616161ff',
            '--fg': '#f0f0f0ff',
            '--primary': '#90f9b3ff',
            '--on-primary': '#000000ff',
            '--primary-hover': '#76e1a1ff',
            '--secondary': '#ff7ca8ff',
            '--accent': '#c975d8ff',
            '--muted': '#8f8f8fff',
            '--dots': '#5a5a5aff',
            '--border': '#ecececff',
            '--blue': '#3b86e0ff',
            '--red': '#ec5050ff',
            '--green': '#10be10ff',
            '--magenta': '#d65cd6ff',
            '--hljs-punctuation': '#999',
            '--hljs-attr': '#8171b6',
            '--hljs-string': '#68a770',
            '--hljs-number': '#2391b7',
            '--hljs-keyword': '#cb8b6b',
        }
    } else if (theme === 'light') {
        return {
            '--bg': '#ffffff',
            '--bg2': '#e9e9e9ff',
            '--fg': '#000000ff',
            '--primary': '#1fda4dff',
            '--on-primary': '#ffffff',
            '--primary-hover': '#1fda4dff',
            '--secondary': '#ff76a8ff',
            '--accent': '#dc7cf7ff',
            '--muted': '#aaaaaaff',
            '--dots': '#dfdfdfff',
            '--border': '#bdbdbdff',
            '--blue': '#a2c0ecff',
            '--red': '#ee8b8bff',
            '--green': '#a9f3a9ff',
            '--magenta': '#f58af5ff',
            '--hljs-punctuation': '#999',
            '--hljs-attr': '#8171b6',
            '--hljs-string': '#68a770',
            '--hljs-number': '#2391b7',
            '--hljs-keyword': '#cb8b6b',
        }
    } else if (theme === 'high-contrast-dark') {
        return {
            '--bg': '#000000ff',
            '--bg2': '#1a1a1aff',
            '--fg': '#ffffff',
            '--primary': '#00ff55ff',
            '--on-primary': '#000000ff',
            '--primary-hover': '#76e1a1ff',
            '--secondary': '#ff9900ff',
            '--accent': '#db26ffff',
            '--muted': '#505d5fff',
            '--dots': '#2e2e2eff',
            '--border': '#ecececff',
            '--blue': '#0073ffff',
            '--red': '#ec5050ff',
            '--green': '#10be10ff',
            '--magenta': '#d65cd6ff',
            '--hljs-punctuation': '#c9c9c9ff',
            '--hljs-attr': '#d169ebff',
            '--hljs-string': '#61ff76ff',
            '--hljs-number': '#00d6e6ff',
            '--hljs-keyword': '#ff8800ff',
        }
    }
}

export const palette = derived(theme, ($theme) => defaultPalette($theme));