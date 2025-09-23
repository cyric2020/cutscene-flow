<script>
    import { palette } from '$lib/theme.js';
    import { get } from 'svelte/store';

    const currentPalette = get(palette);
    console.log('Current palette:', currentPalette);

    // import elkjs
    import ELK from 'elkjs/lib/elk.bundled.js';
    import { zoom, zoomIdentity } from 'd3-zoom';
    import { select } from 'd3-selection';
    import { onMount } from 'svelte';

    export let beats = [];
    export let edges = null;
    export let selectedNodeId = null;

    let choice_beats = [];
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    const elk = new ELK();

    const idx = new Map(beats.map((b, i) => [b.id, i]));

    function isSequential(from, to) {
        return (idx.get(to) ?? -2) === (idx.get(from) ?? -1) + 1;
    }
    function isLoop(from, to) {
        return (idx.get(to) ?? 1e9) <= (idx.get(from) ?? -1);
    }

    function dedupeBeats(beats) {
        const seen = new Set();
        return beats.filter(beat => {
            if (seen.has(beat.id)) {
                return false;
            }
            seen.add(beat.id);
            return true;
        });
    }

    function buildEdges(beats) {
        const edges = [];
        beats.forEach(beat => {
            // see if the beat contains a goto action or a choice action, otherwise link it to the next beat
            for (const action of beat.actions || []) {
                if (action.type === 'goto' && action.cutsceneId == "current" && action.beatId) {
                    edges.push({ from: beat.id, to: action.beatId });
                } else if (action.type === 'choice' && Array.isArray(action.choices)) {
                    for (const option of action.choices) {
                        if (option.cutsceneId == "current" && option.entryBeatId && option.type === "goto") {
                            edges.push({ from: beat.id, to: option.entryBeatId });
                        }
                    }
                    choice_beats.push(beat.id);
                }
            }
            // if no goto or choice action found, link to next beat in the list
            if (!beat.actions || beat.actions.length === 0 || !beat.actions.some(a => a.type === 'goto' || a.type === 'choice')) {
                const currentIndex = beats.findIndex(b => b.id === beat.id);
                if (currentIndex >= 0 && currentIndex < beats.length - 1) {
                    edges.push({ from: beat.id, to: beats[currentIndex + 1].id });
                }
            }
        });
        return edges;
    }

    function crToBezier(points, tau = 0.5) {
        const n = points.length;
        if (n < 2) return '';

        // duplicate ends
        const pts = [
            { x: points[0].x, y: points[0].y },
                ...points.map(p => ({ x: p.x, y: p.y })),
            { x: points[n - 1].x, y: points[n - 1].y },
        ];

        // special case: straight two-point segment → slight arch along normal
        if (n === 2) {
            const p0 = points[0], p1 = points[1];
            const dx = p1.x - p0.x, dy = p1.y - p0.y;
            const len = Math.hypot(dx, dy) || 1;
            const nx = -dy / len, ny = dx / len;               // unit normal
            const hump = Math.min(60, len * 0.2);              // bounded curvature
            const c1 = { x: p0.x + dx * 0.33 + nx * hump, y: p0.y + dy * 0.33 + ny * hump };
            const c2 = { x: p0.x + dx * 0.66 + nx * hump, y: p0.y + dy * 0.66 + ny * hump };
            return `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`;
        }

        const k = tau / 6; // 1/6 factor
        let d = `M ${pts[1].x} ${pts[1].y}`;
        // build segments between original points 0..n-2 (shifted by +1 due to duplication)
        for (let i = 1; i <= n - 1; i++) {
            const p0 = pts[i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2];
            const c1 = { x: p1.x + (p2.x - p0.x) * k, y: p1.y + (p2.y - p0.y) * k };
            const c2 = { x: p2.x - (p3.x - p1.x) * k, y: p2.y - (p3.y - p1.y) * k };
            d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
        }
        return d;
    }

    function edgeToPath(edge) {
        const sections = edge.sections || [];
        if (sections.length === 0) return '';
        let d = '';
        for (const s of sections) {
            const pts = [s.startPoint, ...(s.bendPoints || []), s.endPoint];
            d += crToBezier(pts) + ' ';
        }
        return d.trim();
    }

    // reactive layout
    let layout = null;
    let lastLayout = null;
    let allBeats = [];
    let allEdges = [];

    function elkEdges() {
        return allEdges.map((edge, i) => {
            const from = edge.from, to = edge.to;
            const main = isSequential(from, to);
            const loop = isLoop(from, to);

            return {
                id: `${from}->${to}#${i}`,
                sources: [from],
                targets: [to],
                properties: {
                    "priority": main ? "100" : "1",
                    "org.eclipse.elk.edge.type": loop ? "FEEDBACK" : "NORMAL",
                    "org.eclipse.elk.port.side": main ? "EAST_WEST": "UNDEFINED",
                    "org.eclipse.elk.layered.edgeStraightening": main ? "true" : "false"
                }
            }
        });
    }

    $: {
        let dedupedBeats = dedupeBeats(beats);
        // add a dummy "end" beat
        if (!dedupedBeats.some(b => b.id === 'end')) {
            dedupedBeats.push({ id: 'end', actions: [] });
        }
        const builtEdges = edges ?? buildEdges(dedupedBeats);
        allBeats = dedupedBeats.map(beat => ({
            id: beat.id,
            name: beat.id,
            prereqIds: [] // Not used in this context
        }));
        allEdges = builtEdges;
    }

    function makeGraph(allBeats) {
        return {
            id: 'root',
            layoutOptions: {
                // 'elk.algorithm': 'layered',
                // 'elk.direction': 'RIGHT',
                // 'elk.layered.spacing.nodeNodeBetweenLayers': '40',
                // 'elk.spacing.nodeNode': '32',
                // 'elk.layered.thoroughness': '7',
                // 'elk.layered.nodePlacement.strategy': 'LAYER_SWEEP', // or 'NETWORK_SIMPLEX' or 'BRANDES_KOEPF'
                // // 'elk.layered.nodePlacement.favorStraightEdges': 'true',
                // 'elk.edgeRouting': 'SPLINES' // or 'POLYLINE'

                "elk.algorithm": "layered",
                "elk.direction": "RIGHT",

                // Respect input order inside layers.
                "elk.layered.considerModelOrder": "true",

                // Use longest-path layering to follow the main chain.
                "elk.layered.layering.strategy": "LONGEST_PATH",

                // Keep nodes aligned horizontally; favor straight edges.
                "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
                "elk.layered.nodePlacement.favorStraightEdges": "true",
                "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",  // try LEFTUP if you want a strict top rail

                // Make edge routing smooth but not authoritative.
                "elk.edgeRouting": "SPLINES",

                // Spacing tuned for a single horizontal “rail”.
                "elk.layered.spacing.nodeNodeBetweenLayers": "80",
                "elk.spacing.nodeNode": "30",
                "elk.spacing.edgeNodeBetweenLayers": "30",
                "elk.spacing.edgeEdge": "15",
            },
            children: allBeats.map(beat => ({
                id: beat.id,
                width: 150,
                height: 50,
                labels: [{ text: `${beat.name}` }]
            })),
            edges: elkEdges()
        };
    }

    $: graph = makeGraph(allBeats);
    $: {
        console.log('Graph before layout:', graph);
        console.log('Edges:', graph.edges);
    }
    $: layoutPromise = elk.layout(graph).then(result => {
        console.log('Layout result:', result);
        console.log('Layout edges:', result.edges);
        lastLayout = result;
        return result;
    });

    // selection/highlight
    // Remove selectedNode export, use local selectedNodeId

    // Zoom and pan functionality
    let svgElement;
    let transform = zoomIdentity;
    

    onMount(() => {
        const zoomBehavior = zoom()
            .scaleExtent([0.1, 3])
            .on('zoom', (event) => {
                transform = event.transform;
            });
        
        select(svgElement).call(zoomBehavior);
        
        return () => {
            select(svgElement).on('.zoom', null);
        };
    });

    $: viewWidth = 800 / transform.k;
    $: viewHeight = 600 / transform.k;
    $: viewX = -transform.x / transform.k;
    $: viewY = -transform.y / transform.k;
    $: rectWidth = viewWidth + 400;
    $: rectHeight = viewHeight + 400;
</script>

<svg bind:this={svgElement} width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <marker id="arrowhead"
            markerWidth="6" markerHeight="4"
            refX="6" refY="2"
            orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="var(--fg)" />
        </marker>
        <pattern id="dotPattern" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="1.5" fill="var(--dots)" />
        </pattern>
    </defs>
    {#await layoutPromise}
        {#if lastLayout}
            <g transform="translate({transform.x},{transform.y}) scale({transform.k})">
                <rect x={viewX - 1000} y={viewY} width={rectWidth + 2000} height={rectHeight} fill="url(#dotPattern)" />
                <!-- Edges -->
                <g fill="none" stroke="var(--fg)" stroke-width="2">
                    {#each lastLayout.edges as edge}
                        {#if edge.sections && edge.sections.length > 0}
                            {#key `${edge.id}-${edge.sections[0].startPoint.x}-${edge.sections[0].startPoint.y}-${edge.sections[0].endPoint.x}-${edge.sections[0].endPoint.y}` }
                                <path d={edgeToPath(edge)} 
                                stroke="var(--fg)" stroke-width="2" fill="none"
                                marker-end="url(#arrowhead)" />
                            {/key}
                        {/if}
                    {/each}
                </g>

                <!-- Nodes -->
                {#each lastLayout.children as node (node.id)}
                <g transform={`translate(${node.x}, ${node.y})`} 
                    on:click={() => {
                        if (selectedNodeId === node.id) {
                            dispatch('selectNode', null); // Deselect if already selected
                        } else {
                            dispatch('selectNode', node.id);
                        }
                    }}
                    on:keydown={(e) => {
                        if (e.key === 'Enter') {
                            if (selectedNodeId === node.id) {
                                dispatch('selectNode', null);
                            } else {
                                dispatch('selectNode', node.id);
                            }
                        }
                    }}
                    aria-label={node.labels[0].text}
                    role="button"
                    tabindex="0"
                    style="cursor: pointer;">

                    <rect width={node.width} height={node.height} rx="10" ry="10"
                        fill={selectedNodeId === node.id ? 'var(--primary)' : (choice_beats.includes(node.id) ? 'var(--secondary)' 
                            : node.labels[0].text === 'end' ? 'var(--accent)' : 'var(--muted)')}
                    />
                    <text x={node.width / 2} y={node.height / 2} text-anchor="middle" dominant-baseline="middle"
                        font-size="14" fill={selectedNodeId === node.id ? 'var(--on-primary)' : 'var(--fg)'}>
                        {node.labels[0].text}
                    </text>
                </g>
            {/each}
            </g>
        {:else}
            <text x="50%" y="50%" text-anchor="middle" font-size="24" fill="gray">Loading...</text>
        {/if}
    {:then layout}
        <g transform="translate({transform.x},{transform.y}) scale({transform.k})">
            <rect x={viewX - 1000} y={viewY} width={rectWidth + 2000} height={rectHeight} fill="url(#dotPattern)" />
            <!-- Edges -->
            <g fill="none" stroke="var(--fg)" stroke-width="2">
                {#each layout.edges as edge}
                    {#if edge.sections && edge.sections.length > 0}
                        {#key `${edge.id}-${edge.sections[0].startPoint.x}-${edge.sections[0].startPoint.y}-${edge.sections[0].endPoint.x}-${edge.sections[0].endPoint.y}` }
                            <path d={edgeToPath(edge)} 
                            stroke="var(--fg)" stroke-width="2" fill="none"
                            marker-end="url(#arrowhead)" />
                        {/key}
                    {/if}
                {/each}
            </g>

            <!-- Nodes -->
            {#each layout.children as node (node.id)}
            <g transform={`translate(${node.x}, ${node.y})`} 
                on:click={() => {
                    if (selectedNodeId === node.id) {
                        dispatch('selectNode', null); // Deselect if already selected
                    } else {
                        dispatch('selectNode', node.id);
                    }
                }}
                on:keydown={(e) => {
                    if (e.key === 'Enter') {
                        if (selectedNodeId === node.id) {
                            dispatch('selectNode', null);
                        } else {
                            dispatch('selectNode', node.id);
                        }
                    }
                }}
                aria-label={node.labels[0].text}
                role="button"
                tabindex="0"
                style="cursor: pointer;">

                <rect width={node.width} height={node.height} rx="10" ry="10"
                    fill={selectedNodeId === node.id ? 'var(--primary)' : (choice_beats.includes(node.id) ? 'var(--secondary)' 
                        : node.labels[0].text === 'end' ? 'var(--accent)' : 'var(--muted)')}
                />
                <text x={node.width / 2} y={node.height / 2} text-anchor="middle" dominant-baseline="middle"
                    font-size="14" fill={selectedNodeId === node.id ? 'var(--on-primary)' : 'var(--fg)'}>
                    {node.labels[0].text}
                </text>
            </g>
        {/each}
        </g>
    {:catch e}
        <text x="50%" y="50%" text-anchor="middle" font-size="24" fill="red">Error: {e.message}</text>
    {/await}
</svg>