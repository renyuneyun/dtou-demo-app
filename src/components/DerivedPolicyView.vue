<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { structureDerivedPoliciesByPorts } from '@/dtou/result_helper';
import RdfNodeView from './RdfNodeView.vue';

const props = defineProps<{
    ports: string[]
    derivedPolicy: string
}>();

const policyMap = ref(new Map<string, Map<string, string[][]>>());

watchEffect(async () => {
    policyMap.value = await structureDerivedPoliciesByPorts(props.derivedPolicy);
    for (const port of props.ports) {
        const polMap = policyMap.value.get(port)!;
        for (const key of polMap.keys()) {
            const values = polMap.get(key)!;
            console.log("key:", key, "value:", values);
        }
    }
    return null;
})
</script>

<template>
    <v-expansion-panels class="derived-policy" v-if="props.derivedPolicy">
        <template v-for="(port) in props.ports" :key="port">
            <v-expansion-panel :title="`Derived Policies for '${port}'`">
                <v-expansion-panel-text>
                    <template v-for="(pol) in policyMap.get(port)?.keys()" :key="pol">
                        <rdf-node-view :title="`Derived Policy ${pol}`" :triples="policyMap.get(port)!.get(pol)!" />
                    </template>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </template>
    </v-expansion-panels>
</template>