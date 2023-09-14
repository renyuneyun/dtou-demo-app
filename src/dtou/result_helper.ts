import N3 from 'n3';
// import { DataFactory } from 'n3';
import namespace from '@rdfjs/namespace'

const RDF = namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const DTOU = namespace("http://example.org/ns#");
const P_A = RDF("type");
const C_CONFLICT = DTOU("Conflict");
const P_PORT = DTOU("port");

export async function parseConflicts(conflicts: string) {
    const parser = new N3.Parser();
    const store = new N3.Store();
    store.addQuads(parser.parse(conflicts));
    const conflictMap = new Map();
    for (const conflictObj of store.getSubjects(P_A, C_CONFLICT)) {
        const conflictInfo = store.getQuads(conflictObj);
        conflictMap.set(conflictObj, conflictInfo);
        console.log("conflict obj:", conflictObj, conflictInfo);
    }
    return conflictMap;
}

export async function structureDerivedPoliciesByPorts(derivedPolicy: string) {
    const parser = new N3.Parser();
    const store = new N3.Store();
    store.addQuads(parser.parse(derivedPolicy));
    const policyMap = new Map();
    for (const quad of store.getQuads(undefined, P_PORT, undefined)) {
        const port = quad.object.value;  //FIXME: Use the port name, not the URI
        const portName = store.getObjects(port, DTOU["name"])[0].value;
        const s = quad.subject;
        const quads = store.getQuads(s);
        let existing = policyMap.get(portName);
        if (!existing) {
            existing = new Map();
        }
        existing.set(s.value, Array.from(quads.map(quad => [quad.subject, quad.predicate, quad.object].map(t => t.value))));
        policyMap.set(portName, existing);
    }
    return policyMap;
}