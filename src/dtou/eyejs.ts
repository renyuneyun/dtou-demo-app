import { n3reasoner, SwiplEye, queryOnce } from 'eyereasoner';

import langGeneral from '@/assets/reasoning/dtou-lang-general.n3s?raw';
import langReasoning from '@/assets/reasoning/dtou-lang-reasoning.n3s?raw';
import lang from '@/assets/reasoning/dtou-lang.n3s?raw';

import queryConflict from '@/assets/reasoning/dtou-query-conflict.n3s?raw';
import queryObligation from '@/assets/reasoning/dtou-query-obligation.n3s?raw';
import queryDerived from '@/assets/reasoning/dtou-query-derived.n3s?raw';

// import testPolicyApp from '@/assets/reasoning/dtou-policy-app1.n3s?raw';
// import testPolicyData from '@/assets/reasoning/dtou-policy-data1.n3s?raw';
// import testPolicyShared from '@/assets/reasoning/dtou-policy-shared.n3s?raw';

/**
 * All in one. Prefer the ones below for separated steps.
 */
export async function runDtouReasoning(sharedKnowledge: string, dataPolicy: string, appPolicy: string, usageContext: string) {
  const dataString = [
    langGeneral,
    langReasoning,
    lang,
    sharedKnowledge,
    dataPolicy,
    appPolicy,
    usageContext
  ].join('\n');

  const conflicts = await n3reasoner(dataString, queryConflict);
  const activatedObligations = await n3reasoner(dataString, queryObligation);
  const derivedPolicy = await n3reasoner(dataString, queryDerived);
  return [conflicts, activatedObligations, derivedPolicy];
}

export async function checkConflicts(sharedKnowledge: string, dataPolicy: string, appPolicy: string, usageContext: string) {

  const dataString = [
    langGeneral,
    langReasoning,
    lang,
    sharedKnowledge,
    dataPolicy,
    appPolicy,
    usageContext
  ].join('\n');

  return await n3reasoner(dataString, queryConflict);
}

export async function checkObligations(sharedKnowledge: string, dataPolicy: string, appPolicy: string, usageContext: string) {
  
  const dataString = [
    langGeneral,
    langReasoning,
    lang,
    sharedKnowledge,
    dataPolicy,
    appPolicy,
    usageContext
  ].join('\n');

  return await n3reasoner(dataString, queryObligation);
}

export async function derivePolicies(sharedKnowledge: string, dataPolicy: string, appPolicy: string, usageContext: string) {
  const dataString = [
    langGeneral,
    langReasoning,
    lang,
    sharedKnowledge,
    dataPolicy,
    appPolicy,
    usageContext
  ].join('\n');

  return await n3reasoner(dataString, queryDerived);
}