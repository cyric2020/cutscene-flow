<script>
    import ActionEditor from "$lib/ActionEditor.svelte";

    export let action = {};
    export let onChange = () => {};

    let localAction = { ...action };

    const transitionOptions = ["fade", "slide", "pop", "replace"];
    const positionOptions = ["left", "right"];

    let actionConstraints = {
        "background.set": {
            backgroundId: { type: "string", required: true },
            transition: { type: "string", required: true, options: transitionOptions },
            duration: { type: "integer", required: true, min: 0 },
            await: { type: "boolean", required: false }
        },
        "character.enter": {
            characterId: { type: "string", required: true },
            pose: { type: "string", required: true },
            position: { type: "string", required: true, options: positionOptions },
            transition: { type: "string", required: true, options: transitionOptions },
            duration: { type: "integer", required: true, min: 0 },
            await: { type: "boolean", required: false }
        },
        "character.exit": {
            characterId: { type: "string", required: true },
            transition: { type: "string", required: true, options: transitionOptions },
            duration: { type: "integer", required: true, min: 0 },
            await: { type: "boolean", required: false }
        },
        "dialogue.show": {
            characterId: { type: "string", required: false },
            text: { type: "string", required: true },
            await: { type: "boolean", required: false }
        },
        "dialogue.chorus": {
            characterId: { type: "list<string>", required: false },
            text: { type: "string", required: true },
            await: { type: "boolean", required: false }
        },
        "dialogue.hide": {
            await: { type: "boolean", required: false }
        },
    };

    $: if (action) {
        localAction = { ...action };
    }

    function handleParamChange(param, value) {
        // set the items in the action (there is not params object, just the items directly in the action)
        if (value === "" || value === null || value === undefined) {
            delete localAction[param];
        } else {
            localAction[param] = value;
        }
        onChange(localAction);
    }

    // check if any field has changed, then check that all of it's fields are valid, if they aren't fix them with defaults
    $: if (action) {
        const constraints = actionConstraints[localAction.type] || {};
        let changed = false;

        for (const [param, constraint] of Object.entries(constraints)) {
            if (constraint.required && (localAction[param] === undefined || localAction[param] === null || localAction[param] === "")) {
                // set default values based on type
                if (constraint.type === "string") {
                    localAction[param] = constraint.options ? constraint.options[0] : "";
                } else if (constraint.type === "integer") {
                    localAction[param] = constraint.min || 0;
                } else if (constraint.type === "boolean") {
                    localAction[param] = false;
                } else if (constraint.type === "list<string>") {
                    localAction[param] = [];
                } else {
                    localAction[param] = null;
                }
                changed = true;
            } else if (constraint.type === "integer" && typeof localAction[param] === "number") {
                if (constraint.min !== undefined && localAction[param] < constraint.min) {
                    localAction[param] = constraint.min;
                    changed = true;
                }
                if (constraint.max !== undefined && localAction[param] > constraint.max) {
                    localAction[param] = constraint.max;
                    changed = true;
                }
            } else if (constraint.type === "string" && constraint.options && !constraint.options.includes(localAction[param])) {
                localAction[param] = constraint.options[0];
                changed = true;
            }
        }

        if (changed) {
            onChange(localAction);
        }
    }

    $: constraints = actionConstraints[localAction.type] || {};

    $: if (constraints) {
        for (const [key, { required }] of Object.entries(constraints)) {
            if (required && !(key in localAction)) {
                // apply a default value based on type
                if (constraints[key].type === "string") {
                    localAction[key] = "";
                } else if (constraints[key].type === "integer") {
                    localAction[key] = 0;
                } else if (constraints[key].type === "boolean") {
                    localAction[key] = false;
                } else if (constraints[key].type === "list<string>") {
                    localAction[key] = [];
                } else {
                    localAction[key] = null;
                }
            }
        }
    }
</script>

<!-- Render each item (not including type) -->
<div class="action-editor">
    {#if Object.keys(constraints).length === 0 && localAction.type !== 'parallel'}
        <p>No parameters defined for this action type.</p>
    {/if}

    {#if localAction.type === 'parallel'}
        {#each localAction.actions as subAction, subIndex}
            <div class="action-param row sub-action">
                <p>Sub-Action {subIndex + 1}:</p>
                <ActionEditor action={subAction} onChange={(e) => {
                    const updatedSubActions = [...localAction.actions];
                    updatedSubActions[subIndex] = e;
                    handleParamChange('actions', updatedSubActions);
                }} />
            </div>
        {/each}
    {:else}
        {#each Object.entries(constraints) as [param, constraint]}
            <div class="action-param row">
                <p>{param}{constraint.required ? '*' : ''}:</p>
                {#if constraint.type === 'string' && constraint.options}
                    <select bind:value={localAction[param]} on:change={(e) => handleParamChange(param, e.target.value)}>
                        <option value="" disabled selected>Select an option</option>
                        {#each constraint.options as option}
                            <option value={option} selected={localAction[param] === option}>{option}</option>
                        {/each}
                    </select>
                {:else if constraint.type === 'string'}
                    <input type="text" bind:value={localAction[param]} on:input={(e) => handleParamChange(param, e.target.value)} />
                {:else if constraint.type === 'integer'}
                    <input type="number" min={constraint.min || undefined} max={constraint.max || undefined} step="1" bind:value={localAction[param]} on:input={(e) => handleParamChange(param, parseInt(e.target.value))} />
                {:else if constraint.type === 'boolean'}
                    <input type="checkbox" checked={localAction[param]} on:change={(e) => handleParamChange(param, e.target.checked)} />
                {:else if constraint.type === 'list<string>'}
                    <select multiple bind:value={localAction[param]} on:change={(e) => handleParamChange(param, Array.from(e.target.selectedOptions, option => option.value))}>
                        {#each constraint.options as option}
                            <option value={option} selected={localAction[param].includes(option)}>{option}</option>
                        {/each}
                    </select>
                {:else}
                    <input type="text" bind:value={localAction[param]} on:input={(e) => handleParamChange(param, e.target.value)} />
                {/if}
            </div>
        {/each}
    {/if}
</div>

<style>
    .action-editor {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
        border-radius: 8px;
        background: var(--green);
    }

    .row {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .sub-action {
        display: flex;
        flex-direction: column;
        padding: 1rem;
        background-color: var(--bg);
        border-radius: 6px;
    }

    .sub-action p {
        margin: 0;
    }

    select, input[type="text"], input[type="number"] {
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

    input[type="checkbox"] {
        transform: scale(1.5);
    }

    p {
        margin: 0;
        font-weight: normal;
        width: fit-content;
    }
</style>