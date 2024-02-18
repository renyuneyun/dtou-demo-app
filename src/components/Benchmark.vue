<script setup lang="ts">
import { extractOutputPortsFromAppPolicy, extractDataUrlFromAppPolicy } from '@/dtou/helper';
import { reactive, ref, watch, watchEffect } from 'vue';

import ConflictView from './ConflictView.vue';
import ActivatedObligationView from './ActivatedObligationView.vue';
import DerivedPolicyView from './DerivedPolicyView.vue';

import { reset, genDataAndPolicy, genAppPolicy } from '@/dtou/generator';
import type { DataPolicySet, OptionsGenDataPolicy, OptionsGenDataPolicyReal, OptionsGenInputSpec } from '@/dtou/generator';
import type { ExecOption } from '@/dtou/benchmark';

const appPolicy = ref('');
const dataPolicy = ref([] as DataPolicySet);
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

const debug = reactive({
    dataUrls: [] as string[]
})

const options = reactive<ExecOption>({
    numData: 1,
    optionsData: {
        attribute: {
            num: 10,
        },
        tag: {
            numSecurity: 2,
            numIntegrity: 2,
            numPurpose: 2,
        },
        obligation: {
            num: 3,
            numArg: 1,
            numBinding: 1
        },
    },
    optionsAppInput: {
        numSecurity: 1,
        numIntegrity: 1,
        numPurpose: 1,
    },
    optionsAppOutput: {
        num: 1,
        options: {
            numInput: 1,
            numDelete: 10,
        }
    }
})

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

async function generateBenchmarkPolicy() {
    reset()
    dataPolicy.value = await genDataAndPolicy(options.numData, options.optionsData)
    appPolicy.value = await genAppPolicy(options.numData, options.optionsAppInput, options.optionsAppOutput.num, options.optionsAppOutput.options)
    // const [resultDataPolicy, resultAppPolicy] = await testGenerate();
    // dataPolicy.value = resultDataPolicy;
    // appPolicy.value = resultAppPolicy;

}

watchEffect(async () => {
    debug.dataUrls = await extractDataUrlFromAppPolicy(appPolicy.value)
})

async function writeDataPolicy() {
    const response = await fetch(`${solidServer.value}/dtou/benchmark/pre`, {
        method: "POST",
        body: JSON.stringify(dataPolicy.value),
    });
    if (response.ok) {
        console.log("Data policy written")
    } else {
        console.error("Data policy failed to write")
    }
}

async function registerApp() {
    const response = await fetch(`${solidServer.value}/dtou`, {
        method: "POST",
        body: JSON.stringify({
            policy: appPolicy.value,
        }),
    });
    if (response.ok) {
        registered.value = true;
    } else {
        registered.value = false;
    }
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
    <v-form ref="form">
        <v-row>
            <v-col cols="12">
                <v-text-field label="Solid Server with DToU capacity" v-model="solidServer"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-text-field label="Output data URL for derived policy" v-model="outputUrl"></v-text-field>
            </v-col>
            <v-col cols="6">
                <v-text-field v-model="options.numData" label="#data" requied />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
                <v-text-field v-model="options.optionsAppInput.numSecurity" label="#Security Tags" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsAppInput.numPurpose" label="#Purpose Tags" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsAppInput.numIntegrity" label="#Integrity Tags" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.attribute.num" label="#Attributes" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.tag.numSecurity" label="#Security" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.tag.numIntegrity" label="#Integrity" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.tag.numPurpose" label="#Purpose" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.tag.numBinding" label="#Binding" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.obligation.num" label="#Obligations" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.obligation.numArg" label="#Args" />
            </v-col>
            <v-col cols="3">
                <v-text-field v-model="options.optionsData.obligation.numBinding" label="#Binding" />
            </v-col>
        </v-row>
    </v-form>
    <v-btn @click="runF(generateBenchmarkPolicy)">
        Generate Policy
    </v-btn>
    <v-btn @click="runF(writeDataPolicy)">
        Write Policy
    </v-btn>
    <v-sheet>
        <v-textarea label="App Policy" v-model="appPolicy">

        </v-textarea>
    </v-sheet>
    <v-sheet>
        <v-textarea label="Data Policy" :model-value="dataPolicy.map(p => p.policy).join('\n')">

        </v-textarea>
    </v-sheet>
    <v-sheet>
        <v-textarea label="Debug" :model-value="JSON.stringify(debug, undefined, 2)">

        </v-textarea>
    </v-sheet>
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
