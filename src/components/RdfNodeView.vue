<script setup lang="ts">
const props = defineProps<{
    title?: string
    triples: string[][]
}>();

</script>

<template>
    <template v-if="props.title">
        <v-textarea :label="props.title" :model-value="JSON.stringify(props.triples, null, 2)">
        </v-textarea>
    </template>
    <template v-else>
        <v-textarea :model-value="JSON.stringify(props.triples, null, 2)">
        </v-textarea>
    </template>
</template>