<script>
    export let x = 0;
    export let y = 0;

    export let tag = '';
    export let text = '';

    import hljs from 'highlight.js/lib/core';
    import json from 'highlight.js/lib/languages/json';

    hljs.registerLanguage('json', json);
    hljs.configure({ languages: ['json'] });
    hljs.initHighlightingOnLoad();

    import { cutscene } from './cutscene.js';

    let jsonToDisplay = {};

    let invalid = false;

    $: {
        if (tag && text) {
            switch (tag) {
                case 'characterId':
                    $cutscene.characters.forEach(c => {
                        if (c.id === text) {
                            jsonToDisplay = c;
                        }
                    });

                    if (!jsonToDisplay) {
                        invalid = true;
                    }
                    break;
                case 'backgroundId':
                    $cutscene.backgrounds.forEach(b => {
                        if (b.id === text) {
                            jsonToDisplay = b;
                        }
                    });

                    if (!jsonToDisplay) {
                        invalid = true;
                    }
                    break;
                case 'soundId':
                    $cutscene.sounds.forEach(s => {
                        if (s.id === text) {
                            jsonToDisplay = s;
                        }
                    });

                    if (!jsonToDisplay) {
                        invalid = true;
                    }
                    break;
                case 'entryBeatId':
                case 'beatId':
                    $cutscene.cutscene.beats.forEach(b => {
                        if (b.id === text) {
                            jsonToDisplay = b;
                        }
                    });

                    if (!jsonToDisplay) {
                        invalid = true;
                    }
                    break;
                default:
                    jsonToDisplay = {};
            }
        } else {
            jsonToDisplay = {};
        }
    }

    let htmlHighlighted;

    $: htmlHighlighted = hljs.highlight(JSON.stringify(jsonToDisplay, null, 2), { language: 'json' }).value;
</script>

{#if tag && text}
    <div class="jsonInfo" style="top: {y + 10}px; left: {x + 10}px;">
        {#if invalid}
            <strong style="color: red;">Invalid {tag}: {text}</strong>
        {:else}
            <strong>{tag}: {text}</strong>
            <pre><code class="json">{@html htmlHighlighted}</code></pre>
        {/if}
    </div>
{/if}

<style>
    .jsonInfo {
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 5px 10px;
        border-radius: 8px;
        pointer-events: none;
        min-width: 300px;
        max-width: fit-content;
        z-index: 1000;
        font-size: 0.9em;
    }
</style>