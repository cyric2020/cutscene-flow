<svelte:head>
    <title>Cutscene Flow</title>
</svelte:head>

<script>
    import { theme } from '$lib/theme.js';
    import { get } from 'svelte/store';

    let currentTheme = get(theme);
    function toggle() {
        theme.update((t) => (t === 'light' ? 'dark' : 'light'));
        currentTheme = get(theme);
        console.log('Theme toggled to:', currentTheme);
    }

    import EditBeat from '$lib/EditBeat.svelte';
    import FlowGraph from '$lib/FlowGraph.svelte';
    let selectedNodeId = null;
    let editingBeat = null;

    let cutscene = {
    "schemaVersion": 1,
    "characters": [
        {
            "id": "alice",
            "name": "Alice",
            "poses": {
                "normal": "alice_normal.png",
                "happy": "alice_happy.png",
                "sad": "alice_sad.png",
                "surprised": "alice_surprised.png",
                "angry": "alice_angry.png"
            }
        },
        {
            "id": "bob",
            "name": "Bob",
            "poses": {
                "normal": "bob_normal.png",
                "happy": "bob_happy.png",
                "sad": "bob_sad.png",
                "surprised": "bob_surprised.png",
                "angry": "bob_angry.png"
            }
        },
        {
            "id": "eve",
            "name": "Eve",
            "poses": {
                "normal": "eve_normal.png",
                "happy": "eve_happy.png",
                "sad": "eve_sad.png",
                "surprised": "eve_surprised.png",
                "angry": "eve_angry.png"
            }
        }
    ],
    "backgrounds": [
        {
            "id": "park",
            "image": "park.png"
        },
        {
            "id": "cafe",
            "image": "cafe.png"
        },
        {
            "id": "library",
            "image": "library.png"
        }
    ],
    "sounds": [
        {
            "id": "explosion",
            "file": "explosion.mp3"
        },
        {
            "id": "backgroundMusic",
            "file": "backgroundAmbiance.mp3"
        }
    ],
    "cutscene": {
        "id": "intro_park",
        "beats": [
            {
                "id": "b0",
                "advance": {
                    "mode": "auto"
                },
                "actions": [
                    {
                        "type": "background.set", "backgroundId": "park", "transition": "fade", "duration": 300, "await": true
                    }
                ]
            },
            {
                "id": "b1",
                "advance": {
                    "mode": "input"
                },
                "actions": [
                    {
                        "type": "parallel",
                        "await": true,
                        "actions": [
                            {
                                "type": "character.enter", "characterId": "alice", "pose": "happy", "position": "left", "transition": "slide", "duration": 400, "await": true
                            },
                            {
                                "type": "dialogue.show", "characterId": "alice", "text": "What a beautiful day in the park, isn't it, {player_name}?", "await": true
                            }
                        ]
                    },
                    {
                        "type": "dialogue.hide", "await": true
                    }
                ]
            },
            {
                "id": "b2",
                "advance": {
                    "mode": "auto_delay",
                    "delay": 200
                },
                "actions": [
                    {
                        "type": "dialogue.show", "characterId": "alice", "text": "I love coming here to relax and enjoy nature.", "await": true
                    }
                ]
            },
            {
                "id": "b3",
                "advance": {
                    "mode": "input"
                },
                "actions": [
                    {
                        "type": "character.exit", "characterId": "alice", "transition": "slide", "duration": 400, "await": true
                    },
                    {
                        "type": "parallel",
                        "await": true,
                        "actions": [
                            {
                                "type": "character.enter", "characterId": "bob", "pose": "normal", "position": "right", "transition": "slide", "duration": 400, "await": true
                            },
                            {
                                "type": "dialogue.show", "characterId": "bob", "text": "Hi, I'm bob.", "await": true
                            }
                        ]
                    }
                ]
            },
            {
                "id": "bExplosion",
                "advance": {
                    "mode": "auto"
                },
                "actions": [
                    {
                        "type": "audio.play", "bus": "sfx", "soundId": "explosion", "volume": 1.0, "pitch": 1.0, "pan": 0.0, "await": true
                    },
                    {
                        "type": "audio.play", "bus": "music", "soundId": "backgroundMusic", "loop": true, "volume": 0.7, "await": false
                    },
                    {
                        "type": "audio.set", "bus": "music", "volume": 0.4
                    },
                    {
                        "type": "audio.stop", "bus": "music", "fadeMs": 400, "await": true
                    }
                ]
            },
            {
                "id": "b4",
                "advance": {
                    "mode": "input"
                },
                "actions": [
                    {
                        "type": "character.exit", "characterId": "bob", "transition": "slide", "duration": 400, "await": true
                    },
                    {
                        "type": "parallel",
                        "await": true,
                        "actions": [
                            {
                                "type": "character.enter", "characterId": "alice", "pose": "surprised", "position": "left", "transition": "slide", "duration": 400, "await": true
                            },
                            {
                                "type": "character.enter", "characterId": "eve", "pose": "surprised", "position": "left", "transition": "slide", "duration": 400, "await": true
                            }
                        ]
                    },
                    {
                        "type": "dialogue.chorus", "characterIds": ["alice", "eve"], "text": "BOB?!?!", "await": true
                    }
                ]
            },
            {
                "id": "branch",
                "advance": {
                    "mode": "input"
                },
                "actions": [
                    {
                        "type": "choice",
                        "prompt": "How do you respond?",
                        "choices": [
                            {
                                "type": "goto",
                                "line": "What are you doing here, Bob?!",
                                "cutsceneId": "current",
                                "entryBeatId": "end"
                            },
                            {
                                "type": "goto",
                                "line": "BOBBY BOY!!",
                                "cutsceneId": "current",
                                "entryBeatId": "insulting-name"
                            },
                            {
                                "type": "goto",
                                "line": "Stay away from us, Bob!",
                                "cutsceneId": "current",
                                "entryBeatId": "short-dialogue"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "short-dialogue",
                "advance": {
                    "mode": "input",
                },
                "actions": [
                    {
                        "type": "dialogue.show", "characterId": "alice", "text": "What are you doing here, Bob?!", "await": true
                    },
                    {
                        "type": "goto", "cutsceneId": "current", "beatId": "end"
                    }
                ]
            },
            {
                "id": "insulting-name",
                "advance": {
                    "mode": "input"
                },
                "actions": [
                    {
                        "type": "character.enter", "characterId": "bob", "pose": "annoyed", "position": "left", "transition": "slide", "duration": 400, "await": true
                    },
                    {
                        "type": "choice",
                        "prompt": "How do you respond?",
                        "choices": [
                            {
                                "type": "goto",
                                "line": "I told you not to call me that",
                                "cutsceneId": "current",
                                "entryBeatId": "annoyed"
                            },
                            {
                                "type": "goto",
                                "line": "AAAAA LICE",
                                "cutsceneId": "current",
                                "entryBeatId": "insult-back"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "annoyed",
                "advance": {
                    "mode": "auto_delay",
                    "delay": 200
                },
                "actions": [
                    {
                        "type": "dialogue.show", "characterId": "alice", "text": "sorryyyyy, it's just so fun to say", "await": true
                    },
                    {
                        "type": "goto", "cutsceneId": "current", "beatId": "end"
                    }
                ]
            },
            {
                "id": "insult-back",
                "advance": {
                    "mode": "auto_delay",
                    "delay": 200
                },
                "actions": [
                    {
                        "type": "dialogue.show", "characterId": "alice", "text": "Hmph", "await": true
                    }
                ]
            }
        ]
    }
};
    let beats = cutscene.cutscene.beats || [];

    function updateBeats() {
        beats = [...beats];
    }

    function onBeatChange(updatedBeat) {
        const index = beats.findIndex(b => b.id === updatedBeat.oldId || b.id === updatedBeat.id);
        if (index !== -1) {
            // Remove oldId from the object before saving
            const { oldId, ...beatToSave } = updatedBeat;
            beats[index] = beatToSave;
            updateBeats();
            if (selectedNodeId === updatedBeat.oldId && updatedBeat.id !== updatedBeat.oldId) {
                selectedNodeId = updatedBeat.id;
            }
            // Optionally, get the new beat object
            // editingBeat = beats.find(b => b.id === updatedBeat.id);
        }
    }

    $: cutscene.cutscene.beats = beats;
    $: editingBeat = beats.find(b => b.id === selectedNodeId) || null;
    
    // update beats when editingBeat changes
    // $: if (editingBeat) {
    //     const index = beats.findIndex(b => b.id === editingBeat.oldId);
    //     console.log(editingBeat.oldId, editingBeat.id);
        
    //     if (index !== -1) {
    //         console.log('Updating beatid ', editingBeat.oldId, ' at index:', index, ' to ', editingBeat.id);

    //         // update oldId if id has changed
    //         if (editingBeat.oldId !== editingBeat.id) {
    //             editingBeat.oldId = editingBeat.id;
    //             beats[index] = editingBeat;
    //         }
    //     }
    // }

    $: console.log('Selected Node ID:', selectedNodeId);
    $: console.log('Beats:', beats);
    $: console.log('Editing Beat:', editingBeat);

    // save cutscene to svelte store for access in other components
    import { cutscene as cutsceneStore } from '$lib/cutscene.js';

    $: cutsceneStore.set(cutscene);
</script>

<div class="container">
    <div class="buttons">
        <h1>Cutscene Flow Editor</h1>
        
        <!-- Add load and save buttons later -->
        <div class="fileops">
            <button on:click={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cutscene, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", "cutscene.json");
                dlAnchorElem.click();
            }}>Save Cutscene</button>
            <input type="file" accept=".json" on:change={(e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const json = JSON.parse(event.target.result);
                            if (json && json.cutscene && Array.isArray(json.cutscene.beats)) {
                                cutscene = json;
                                beats = cutscene.cutscene.beats;
                                selectedNodeId = null;
                                editingBeat = null;
                            } else {
                                alert("Invalid cutscene JSON structure.");
                            }
                        } catch (err) {
                            alert("Error parsing JSON: " + err.message);
                        }
                    };
                    reader.readAsText(file);
                }
            }} />
        </div>

        <button on:click={toggle}>Enable {currentTheme === 'light' ? 'Dark' : 'Light'} Mode</button>
    </div>
    <div class="content">
        <div class="left">
            <h2>Selected Node</h2>
            {#if selectedNodeId && editingBeat}
                <EditBeat beat={editingBeat} onChange={onBeatChange} />
            {:else}
                <p>No node selected.</p>
            {/if}
        </div>
        <div class="right">
            <h2>Flow Graph</h2>
            <FlowGraph bind:beats={beats} selectedNodeId={selectedNodeId} on:selectNode={e => selectedNodeId = e.detail} />
        </div>
    </div>
</div>


<style>
    .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background-color: var(--bg);
        color: var(--fg);
    }
    .buttons {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        background-color: var(--bg);
        border-bottom: 1px solid var(--muted);
    }
    .buttons button {
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
        background-color: var(--primary);
        color: var(--on-primary);
        border: none;
        border-radius: 4px;
    }
    .buttons button:hover {
        background-color: var(--primary-hover);
    }
    .content {
        display: flex;
        flex: 1;
        overflow: hidden;
    }
    .left, .right {
        flex: 1;
        padding: 20px;
    }
    .left {
        border-right: 1px solid var(--muted);
        max-width: 25vw;
        overflow-y: auto;
    }
    .right {
        overflow: hidden;
    }
    pre {
        background-color: var(--bg2);
        padding: 10px;
        border-radius: 4px;
        white-space: pre-wrap;
        word-wrap: break-word;
    }

    input[type="file"] {
        color: var(--fg);
    }
</style>
