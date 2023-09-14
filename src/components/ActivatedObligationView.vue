<script setup lang="ts">
const props = defineProps<{
    activatedObligation: string
}>();
</script>

<template>
    <v-expansion-panels class="activated-obligation" v-if="props.activatedObligation">
        <v-expansion-panel title="Activated Obligations">
            <v-expansion-panel-text>
                <v-textarea label="Activated Obligations" :model-value="props.activatedObligation">
                </v-textarea>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>