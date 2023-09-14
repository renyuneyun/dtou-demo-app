<script setup lang="ts">
import { parseConflicts } from '@/dtou/result_helper.ts';
import { ref, watch, watchEffect } from 'vue';
import { Quad } from 'n3';
import RdfNodeView from './RdfNodeView.vue';

const props = defineProps<{
    conflict: Quad[]
}>();

function quadToString(quad: Quad) {
    return `${quad._subject.id} ${quad._predicate.id} ${quad._object.id}`;
}

function quadToArray(quads: Quad[]) {
    return Array.from(quads.map(quad => [quad.subject, quad.predicate, quad.object].map(t => t.value)));
}
</script>

<template>
    <!-- <template v-for="(quad, i) in conflict" :key="i">
        <v-text-field :model-value="quadToString(quad)"></v-text-field>
    </template> -->
    <rdf-node-view :triples="quadToArray(props.conflict)" />
</template>

