import N3 from 'n3';
// import { DataFactory } from 'n3';
import namespace from '@rdfjs/namespace'
import { QueryEngine, QueryEngineFactory } from '@comunica/query-sparql';

const RDF = namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const DTOU = namespace("http://example.org/ns#");
const P_A = RDF("type");
const C_INPUTSPEC = DTOU("InputSpec");
const C_APPPOLICY = DTOU("AppPolicy");
const C_PORT = DTOU("Port");
const P_DATA = DTOU("data");
const P_OUTPUTSPEC = DTOU("output_spec");
const P_PORT = DTOU("port");
const P_NAME = DTOU("name");

const myEngine = new QueryEngine();

const PREFIXES = `
PREFIX dtou: <http://example.org/ns#>
`;

export function rdfToStore(rdfDoc: string) {
    const parser = new N3.Parser();
    const store = new N3.Store();
    store.addQuads(parser.parse(rdfDoc));
    return store
}

async function query(rdfDoc: string, query: string) {
    return (await myEngine.queryBindings(
        `${PREFIXES}\n${query}`,
        {
            sources: [rdfToStore(rdfDoc)]
        }
    )).toArray();
}

export async function extractDataUrlFromAppPolicy(appPolicy: string) {
    const store = rdfToStore(appPolicy);
    const dataUrls = [] as string[];
    // for (const s of store.getSubjects(P_A, C_INPUTSPEC)) {
    //     dataUrls.push(...store.getObjects(s, P_DATA).map(o => o.id));
    // }
    for (const binding of await query(appPolicy, `
    SELECT ?s WHERE {
        ?s a dtou:InputSpec.
    }
    `)) {
        const s = binding.get("s").value;
        for (const binding of await query(appPolicy, `
        SELECT ?o WHERE {
            <${s}> dtou:data ?o.
        }
        `)) {
            const [o] = ["o"].map(v => binding.get(v).value);
            dataUrls.push(o);
        }
    }
    return dataUrls;
}

export async function extractOutputPortsFromAppPolicy(appPolicy:string) {
    const store = rdfToStore(appPolicy);
    const outputPorts = [] as string[];
    for (const binding of await query (appPolicy, `
    SELECT ?n WHERE {
        ?p a dtou:AppPolicy;
            dtou:output_spec ?output_spec.
        ?output_spec dtou:port ?port.
        ?port dtou:name ?n.
    }
    `)) {
        const [n] = ["n"].map(v => binding.get(v).value);
        outputPorts.push(n);
    }
    return outputPorts;
}

export async function getDtouUrl(dataUrl: string) {
    return dataUrl.replace(".ttl", ".dtou.ttl");
}

export async function getDtou(dataUrls: string[]) {
    return await Promise.all(
      dataUrls.map(async (u) => fetch(await getDtouUrl(u)).then(async (res) => await res.text()))
    )
}