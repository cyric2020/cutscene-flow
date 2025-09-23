import { writable } from 'svelte/store';

// store for the current cutscene data
export const cutscene = writable({
    title: "New Cutscene",
    characters: [],
    backgrounds: [],
    sounds: [],
    cutscene: {}
});