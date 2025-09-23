<script>
  import ActionEditor from "./ActionEditor.svelte";

    export let actions = [];
    export let onChange = () => {};

    let localActions = [...actions];

    $: if (actions) {
        localActions = [...actions];
    }

    function addAction() {
        localActions = [...localActions, { type: 'new_action', params: {} }];
        onChange(localActions);
    }

    function updateAction(index, newAction) {
        localActions[index] = newAction;
        localActions = [...localActions];
        onChange(localActions);
    }

    function removeAction(index) {
        localActions.splice(index, 1);
        localActions = [...localActions];
        onChange(localActions);
    }

    function moveActionUp(index) {
        if (index > 0) {
            const action = localActions.splice(index, 1)[0];
            localActions.splice(index - 1, 0, action);
            localActions = [...localActions];
            onChange(localActions);
        }
    }

    function moveActionDown(index) {
        if (index < localActions.length - 1) {
            const action = localActions.splice(index, 1)[0];
            localActions.splice(index + 1, 0, action);
            localActions = [...localActions];
            onChange(localActions);
        }
    }

    function handleTypeChange(index, e) {
        const newType = e.target.value;
        const updatedAction = { ...localActions[index], type: newType };
        updateAction(index, updatedAction);
    }
</script>

{#if localActions.length === 0}
    <p>No actions defined.</p>
{/if}

<div class="action-editor">
    <p>Actions:</p>
    <div class="actions">
        {#each localActions as action, index}
            <div class="action">
                <div class="actionInfo">
                    <select bind:value={action.type} on:change={(e) => handleTypeChange(index, e)}>
                        <option value="background.set" selected={action.type === 'background.set'}>Set Background</option>
                        <option value="character.enter" selected={action.type === 'character.enter'}>Enter Character</option>
                        <option value="character.exit" selected={action.type === 'character.exit'}>Exit Character</option>
                        <option value="dialogue.show" selected={action.type === 'dialogue.show'}>Show Dialogue</option>
                        <option value="dialogue.chorus" selected={action.type === 'dialogue.chorus'}>Chorus Dialogue</option>
                        <option value="dialogue.hide" selected={action.type === 'dialogue.hide'}>Hide Dialogue</option>

                        <!-- Add more action types as needed -->
                    </select>
                    <button on:click={() => moveActionUp(index)} disabled={index === 0}>↑</button>
                    <button on:click={() => moveActionDown(index)} disabled={index === localActions.length - 1}>↓</button>
                    <button on:click={() => removeAction(index)}>Remove</button>
                </div>
                <ActionEditor action={action} onChange={(e) => updateAction(index, e)} />
            </div>
        {/each}
    </div>
</div>

<style>
    .action-editor {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: var(--green);
        border-radius: 8px;
    }
    .action-editor p {
        margin: 0;
    }
    .actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .action {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.5rem;
        border: 1px solid var(--fg);
        border-radius: 8px;
        background: var(--bg);
    }

    .actionInfo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
</style>