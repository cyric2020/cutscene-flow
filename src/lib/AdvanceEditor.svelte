<script>
    export let advance = {};
    export let onChange = () => {};

    let localAdvance = { ...advance };

    // make local advance copy when advance prop changes
    $: if (advance) {
        localAdvance = { ...advance };
    }

    // add auto_delay option is chosen, add a duration property defaulting to 200ms if not present, remove if not chosen
    $: if (localAdvance.mode === 'auto_delay' && !localAdvance.duration) {
        localAdvance.duration = 200;
        onChange(localAdvance);
    } else if (localAdvance.mode !== 'auto_delay' && localAdvance.duration) {
        delete localAdvance.duration;
        onChange(localAdvance);
    }
</script>

<div class="advance">
    <div class="advance_all row">
        <p>Advance Mode: </p>
        <select bind:value={localAdvance.mode} on:change={() => onChange(localAdvance)}>
            <option value="auto" selected={localAdvance.mode === 'auto'}>Auto</option>
            <option value="input" selected={localAdvance.mode === 'input'}>Input</option>
            <option value="auto_delay" selected={localAdvance.mode === 'auto_delay'}>Auto Delay</option>
        </select>
    </div>

    {#if localAdvance.mode === 'auto_delay'}
        <div class="advance_delay row">
            <p>Delay Duration (ms): </p>
            <input type="number" min="0" bind:value={localAdvance.duration} on:input={() => onChange(localAdvance)} />
        </div>
    {/if}
</div>

<style>
    .advance {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 8px;
        background: var(--red);
    }

    .row {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    select, input {
        flex-grow: 1;
        display: block;
        box-sizing: border-box;
        font-size: 1rem;
        padding: 0.25rem;
        border: 1px solid var(--fg);
        border-radius: 4px;
        background: var(--bg);
        color: var(--fg);
        min-width: 0;
    }

    p {
        margin: 0;
        font-weight: normal;
        width: fit-content;
    }
</style>


