<script setup lang="ts">
import { parseConflicts } from '@/dtou/result_helper.ts';
import { ref, watch, watchEffect } from 'vue';
import ConflictItem from './ConflictItem.vue';

const props = withDefaults(defineProps<{
    conflicts?: string
}>(), {
    conflicts: ''
});

const conflicts = ref(null);

watchEffect(async () => {
    const conflictMap = await parseConflicts(props.conflicts);
    conflicts.value = conflictMap;
    return null;
});

</script>

<template>
    <v-expansion-panels class="conflict" v-if="conflicts && conflicts.size > 0">
        <v-expansion-panel title="Conflicts">
            <v-expansion-panel-text>
                <template v-for="k in conflicts.keys()" :key="k.id">
                    <ConflictItem :conflict="conflicts.get(k)" />
                </template>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

