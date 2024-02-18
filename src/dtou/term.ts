/**
 * File for all namespaces and terms used in this project.
 * TODO: Replace existing separated definitions with this file.
 */
import namespace from '@rdfjs/namespace';

export const IRI_DTOU = "http://example.org/ns#";

export const RDF = namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
export const DTOU = namespace(IRI_DTOU);

export const P_A = RDF("type");
export const A = P_A;

export const C_INPUTSPEC = DTOU("InputSpec");
export const C_APPPOLICY = DTOU("AppPolicy");
export const C_PORT = DTOU("Port");
export const P_DATA = DTOU("data");
export const P_OUTPUTSPEC = DTOU("output_spec");
export const P_PORT = DTOU("port");
export const P_NAME = DTOU("name");