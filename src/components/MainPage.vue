<script setup lang="ts">
import { extractOutputPortsFromAppPolicy } from '@/dtou/helper';
import { reactive, ref, watch, watchEffect } from 'vue';

import ConflictView from './ConflictView.vue';
import ActivatedObligationView from './ActivatedObligationView.vue';
import DerivedPolicyView from './DerivedPolicyView.vue';

// import { testGenerate } from '@/dtou/generator';

// import testPolicyApp from '@/assets/reasoning/dtou-policy-app-test1.n3s?raw';
import testPolicyApp from '@/assets/reasoning/dtou-policy-app-test2.n3s?raw';
// import testPolicyUsageContext from '@/assets/reasoning/dtou-policy-usage1.n3s?raw';

const appPolicy = ref(testPolicyApp);
// const usageContext = ref(testPolicyUsageContext);

const outputPorts = ref([] as string[]);

const solidServer = ref("http://localhost:3000");
const outputUrl = ref("http://localhost:3000/test/dtou-test/test1/out1.ttl");

const safeRequest = ref(true);
const registered = ref(false);
const widgetEnabled = reactive({
    checkConflicts: false,
    activatedObligation: false,
    derivedPolicy: false,
});

const conflict = ref("");
const activatedObligation = ref("");
const derivedPolicy = ref("");

const running = ref(false);

watch(appPolicy, async (v) => {
    outputPorts.value = await extractOutputPortsFromAppPolicy(v);
    return null;
}, { immediate: true });

watchEffect(() => {
    if (safeRequest.value) {
        if (registered.value) {
            widgetEnabled.checkConflicts = true;
            widgetEnabled.activatedObligation = true;
            widgetEnabled.derivedPolicy = true;
        } else {
            widgetEnabled.checkConflicts = false;
            widgetEnabled.activatedObligation = false;
            widgetEnabled.derivedPolicy = false;
        }
    } else {
        widgetEnabled.checkConflicts = true;
        widgetEnabled.activatedObligation = true;
        widgetEnabled.derivedPolicy = true;
    }
})

async function registerApp() {
    const result = await testGenerate();
    appPolicy.value = result;

    // const response = await fetch(`${solidServer.value}/dtou`, {
    //     method: "POST",
    //     body: JSON.stringify({
    //         policy: appPolicy.value,
    //     }),
    // });
    // if (response.ok) {
    //     registered.value = true;
    // } else {
    //     registered.value = false;
    // }
}

async function iCheckConflicts() {
    const response = await fetch(`${solidServer.value}/dtou/compliance`);

    conflict.value = await response.text();
}

async function iCheckObligations() {
    const response = await fetch(`${solidServer.value}/dtou/activated-obligations`);

    activatedObligation.value = await response.text();
}

async function iDerivePolicies(port?: string) {
    const url0 = `${solidServer.value}/dtou/derived-policies`;
    const url = port ? `${url0}/${port}` : url0;
    let response;
    if (!port) {
        response = await fetch(url);
    } else {
        response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                'url': outputUrl.value,
            }),
        });
    }

    derivedPolicy.value = await response.text();
}

async function runF(f: Function) {
    running.value = true;
    const ret = await f();
    running.value = false;
    return ret;
}
</script>

<template>
    <!-- <v-sheet class="usage-context-div">
        <v-textarea label="Usage Context" v-model="usageContext">

        </v-textarea>

    </v-sheet> -->
    <v-sheet class="app-policy-div">
        <v-textarea label="App Policy" v-model="appPolicy">

        </v-textarea>

    </v-sheet>
    <v-text-field label="Solid Server with DToU capacity" v-model="solidServer"></v-text-field>
    <v-text-field label="Output data URL for derived policy" v-model="outputUrl"></v-text-field>
    <v-btn @click="runF(registerApp)">
        Register App
    </v-btn>
    <v-btn  @click="runF(iCheckConflicts)" :disabled="!widgetEnabled.checkConflicts">
        Check Conflicts
    </v-btn>
    <v-btn @click="runF(iCheckObligations)" :disabled="!widgetEnabled.activatedObligation">
        Check Activated Obligations
    </v-btn>
    <v-btn @click="runF(iDerivePolicies)" :disabled="!widgetEnabled.derivedPolicy">
        Derive Output Policies
    </v-btn>
    <template v-for="port in outputPorts" :key="port">
        <v-btn @click="runF(() => iDerivePolicies(port))" :disabled="!widgetEnabled.derivedPolicy">
            Derive&Write Policy for &lt;{{ port }}>
        </v-btn>
    </template>
    <template v-if="running">
        <v-progress-circular indeterminate></v-progress-circular>
    </template>
    <conflict-view :conflicts="conflict" />
    <activated-obligation-view :activated-obligation="activatedObligation" />
    <derived-policy-view :derived-policy="derivedPolicy" :ports="outputPorts" />
</template>
