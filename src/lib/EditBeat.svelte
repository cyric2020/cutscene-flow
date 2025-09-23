<script>
    import ActionsEditor from "./ActionsEditor.svelte";
    import AdvanceEditor from "./AdvanceEditor.svelte";
    import JsonInfo from "./JsonInfo.svelte";

    import hljs from 'highlight.js/lib/core';
    import json from 'highlight.js/lib/languages/json';

    hljs.registerLanguage('json', json);
    hljs.configure({ languages: ['json'] });
    hljs.initHighlightingOnLoad();

    let htmlHighlighted;

    $: htmlHighlighted = hljs.highlight(JSON.stringify(beat, null, 2), { language: 'json' }).value;

    export let beat = {};
    export let onChange = () => {};

    let localId = beat.id;

    $: if (beat && localId !== beat.id) {
        localId = beat.id;
    }

    function handleIdInput(e) {
        const newId = e.target.value;
        onChange({ ...beat, id: newId, oldId: beat.id });
    }

    let mouseX = 0;
    let mouseY = 0;
    let tag = '';
    let text = '';
    const jsonTAGS = ['characterId', 'backgroundId', 'soundId', 'entryBeatId', 'beatId']

    function handleMouseMove(e) {
        const codeElement = e.currentTarget;
        const { top, left } = codeElement.getBoundingClientRect();
        const x = e.clientX - left + codeElement.scrollLeft;
        const y = e.clientY - top + codeElement.scrollTop;

        mouseX = e.clientX;
        mouseY = e.clientY;

        // get the span element at the mouse position
        const span = document.elementFromPoint(e.clientX, e.clientY);

        // check that it is a child of the code element
        if (codeElement.contains(span) && span.tagName === 'SPAN') {
            const spanText = span.textContent;
            // get the element 2 before the current one
            const prevSpan = span.previousElementSibling;
            const prevPrevSpan = prevSpan ? prevSpan.previousElementSibling : null;

            console.log({spanText, prev: prevSpan ? prevSpan.textContent : null, prevPrev: prevPrevSpan ? prevPrevSpan.textContent : null});

            if (prevSpan && prevSpan.textContent == ":" && jsonTAGS.includes(prevPrevSpan ? prevPrevSpan.textContent.replace(/"/g, '') : '')) {
                tag = prevPrevSpan ? prevPrevSpan.textContent.replace(/"/g, '') : '';
                text = spanText.replace(/"/g, '');
            } else {
                tag = '';
                text = '';
            }
        } else {
            tag = '';
            text = '';
        }
    }
</script>

<JsonInfo x={mouseX} y={mouseY} tag={tag} text={text} />

<div class="content">
    <p>Editing Beat: <input value={beat.id} on:input={handleIdInput} /></p>
    <AdvanceEditor advance={beat.advance} onChange={(e) => onChange({ ...beat, advance: e })} />

    <pre><code class="json" on:mousemove={handleMouseMove} on:mouseleave={() => { tag = ''; text = ''; }}>{@html htmlHighlighted}</code></pre>

    <!-- <ActionsEditor actions={beat.actions} onChange={(e) => onChange({ ...beat, actions: e })} /> -->
</div>

<style>
    .content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    input {
        font-size: 1rem;
        padding: 0.25rem;
        border: 1px solid var(--fg);
        border-radius: 4px;
        background: var(--bg);
        color: var(--fg);
    }

    pre {
        background: var(--bg);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
    }

    p {
        display: flex;
        gap: 1rem;
        padding: 0.5rem;
        background-color: var(--blue);
        border-radius: 8px;
        margin: 0;
        font-size: 1.2rem;
    }
    p input {
        flex-grow: 1;
        min-width: min-content;
    }
</style>