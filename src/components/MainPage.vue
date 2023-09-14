<script setup lang="ts">
import { runDtouReasoning as run, checkConflicts, checkObligations, derivePolicies } from '@/dtou/eyejs.ts';
import { extractDataUrlFromAppPolicy, getDtou, extractOutputPortsFromAppPolicy } from '@/dtou/helper.ts';
import { ref, watch } from 'vue';

import ConflictView from './ConflictView.vue';
import ActivatedObligationView from './ActivatedObligationView.vue';
import DerivedPolicyView from './DerivedPolicyView.vue';

import testPolicyApp from '@/assets/reasoning/dtou-policy-app-test1.n3s?raw';
import testPolicyData from '@/assets/reasoning/dtou-policy-data1.n3s?raw';
import testPolicyShared from '@/assets/reasoning/dtou-policy-shared.n3s?raw';
import testPolicyUsageContext from '@/assets/reasoning/dtou-policy-usage1.n3s?raw';


const sharedKnowledge = ref(testPolicyShared);  // TODO: remove some day. Duplicated declarations won't affect reasoning.
// const dataPolicy = ref(testPolicyData);
const dataPolicy = ref("");
const appPolicy = ref(testPolicyApp);
const usageContext = ref(testPolicyUsageContext);

const dataUrls = ref([] as string[]);
const outputPorts = ref([] as string[]);

const conflict = ref("");
const activatedObligation = ref("");
const derivedPolicy = ref("");

const running = ref(false);

watch(appPolicy, async (v) => {
    outputPorts.value = await extractOutputPortsFromAppPolicy(v);
    return null;
}, { immediate: true });

async function obtainDataUrls() {
    dataUrls.value = await extractDataUrlFromAppPolicy(appPolicy.value);
}

async function retrieveInputDataPolicies() {
    // console.log("Getting DToU from data", dataUrls.value);

    const dtouList = await getDtou(dataUrls.value);
    // console.log("Got DToU content", dtouList);

    dataPolicy.value = dtouList.join("\n");
}

async function runReasoning() {
    const [confictString, activatedObligationString, derivedPolicyString] = await run(sharedKnowledge.value, dataPolicy.value, appPolicy.value, usageContext.value);
    conflict.value = confictString;
    activatedObligation.value = activatedObligationString;
    derivedPolicy.value = derivedPolicyString;
}

async function iCheckConflicts() {
    conflict.value = await checkConflicts(sharedKnowledge.value, dataPolicy.value, appPolicy.value, usageContext.value);
}

async function iCheckObligations() {
    activatedObligation.value = await checkObligations(sharedKnowledge.value, dataPolicy.value, appPolicy.value, usageContext.value);
}

async function iDerivePolicies() {
    derivedPolicy.value = await derivePolicies(sharedKnowledge.value, dataPolicy.value, appPolicy.value, usageContext.value);
}

async function runF(f: Function) {
    running.value = true;
    const ret = await f();
    running.value = false;
    return ret;
}
</script>

<template>
    <v-sheet border class="shared-knowledge-div">
        <v-textarea label="Shared Knowledge" v-model="sharedKnowledge">

        </v-textarea>
    </v-sheet>
    <v-sheet class="usage-context-div">
        <v-textarea label="Usage Context" v-model="usageContext">

        </v-textarea>

    </v-sheet>
    <v-sheet class="app-policy-div">
        <v-textarea label="App Policy" v-model="appPolicy">

        </v-textarea>

    </v-sheet>
    <v-sheet border class="data-policy-div">
        <v-textarea label="Data URLs" v-model="dataUrls">

        </v-textarea>
    </v-sheet>
    <v-btn @click="runF(obtainDataUrls)">
        Obtain input data URLs
    </v-btn>
    <v-btn @click="runF(retrieveInputDataPolicies)">
        Retrieve input data policies
    </v-btn>
    <v-btn  @click="runF(iCheckConflicts)">
        Check Conflicts
    </v-btn>
    <v-btn @click="runF(iCheckObligations)">
        Check Activated Obligations
    </v-btn>
    <v-btn @click="runF(iDerivePolicies)">
        Derive Output Policies
    </v-btn>
    <template v-if="running">
        <v-progress-circular indeterminate></v-progress-circular>
    </template>
    <conflict-view :conflicts="conflict" />
    <activated-obligation-view :activated-obligation="activatedObligation" />
    <derived-policy-view :derived-policy="derivedPolicy" :ports="outputPorts" />
</template>
