import {
    Quad,
    DataFactory,
    NamedNode,
    BlankNode,
    Store,
    Writer,
    Literal,
    type Quad_Subject,
    type Quad_Predicate,
    type Quad_Object
} from 'n3'
import namespace from '@rdfjs/namespace';
import { DTOU, A, IRI_DTOU } from './term.js'

const DATAPOL = namespace('urn:data:pol#')
const APPPOL = namespace('urn:app:pol#')

const { quad, blankNode, namedNode, literal } = DataFactory

type Node = NamedNode | BlankNode

type QuadProto = [Quad_Subject, Quad_Predicate, Quad_Object]
type QuadProtoExtended = [Quad_Subject, Quad_Predicate, Quad_Object | Quad_Object[]]

interface GenAttributesOutput {
    attributes: Node[]
    quads: Quad[]
}

interface TagNodes {
    security: Node[]
    integrity: Node[]
    purpose: Node[]
}

interface GenTagsOutput {
    tags: TagNodes
    quads: Quad[]
}

interface GenObligationsOutput {
    obligations: Node[]
    quadProtos: QuadProtoExtended[]
}

interface GenTaggingOutput {
    nodes: Node[]
    triples: QuadProto[]
}

export type DataPolicySet = {
    url: string
    policy: string
}[]

export interface OptionsGenDataPolicy {
    attribute?: {
        num: number,
    },
    tag?: {
        numSecurity?: number,
        numPurpose?: number,
        numIntegrity?: number,
        numBinding?: number,
    }
    obligation?: {
        num: number,
        numArg?: number,
        numBinding?: number,
    }
}

export interface OptionsGenDataPolicyReal {
    attribute: {
        num: number,
    },
    tag: {
        numSecurity?: number,
        numPurpose?: number,
        numIntegrity?: number,
        numBinding?: number,
    }
    obligation: {
        num: number,
        numArg?: number,
        numBinding?: number,
    }
}

export interface OptionsGenInputSpec {
    numIntegrity?: number
    numPurpose?: number
    numSecurity?: number
}

const APP_NAME = 'urn:dtou:app-benchmark'
const APP_ACTION = DTOU['book-appointment']

function iWriter() {
    return new Writer({
        prefixes: {
            dtou: IRI_DTOU
        }
    })
}

function iDataUrl(index: number) {
    return `http://localhost:3000/test/dtou-test/benchmark/data${index}`
}

function iInputPortName(index: number) {
    return `inputPort${index}`
}

function iOutputPortName(index: number) {
    return `outputPort${index}`
}

function getResultAsString(writer: Writer): Promise<string> {
    return new Promise((resolve, reject) => {
        writer.end((error: any, result: string) => {
            if (error) {
                reject(error)
            }
            resolve(result)
        })
    })
}

const fakeRandomInfo = {
    attributeCount: 0
}

export function reset() {
    fakeRandomInfo.attributeCount = 0
}

function rand(maxNum: number): number {
    return Math.floor(Math.random() * maxNum)
}

function randAttrNum(retrieve?: Boolean, consec?: Boolean): number {
    if (retrieve) {
        return rand(fakeRandomInfo.attributeCount)
    } else {
        if (!consec) {
            return ++fakeRandomInfo.attributeCount
        } else {
            return fakeRandomInfo.attributeCount
        }
    }
}

function randomName(retrieve?: Boolean, consec?: Boolean): Node {
    return DATAPOL[`AttrName${randAttrNum(retrieve, consec)}`]
}

function randomClass(): Node
function randomClass(retrieve: Boolean, consec?: Boolean): Node
function randomClass(store: Store, attributes: Node[]): Node
function randomClass(store?: Store|Boolean, attributes?: Node[]|Boolean): Node {
    if (typeof(store) === 'boolean') {
    // if (isBooleanObject(store)) {
        return DATAPOL[`MyClass${randAttrNum(store, attributes as Boolean)}`];
    }
    if (store && attributes) {
        const attr = randomAttribute(attributes as Node[])
        return (store as Store).getObjects(attr, DTOU.class, null)[0] as Node // FIXME: Type may be incorrect?? The returned are Quad_Object, not Node??
    }
    return DATAPOL[`MyClass${randAttrNum()}`]
}

function randomValue(retrieve?: Boolean, consec?: Boolean): Literal {
    return literal(randAttrNum(retrieve, consec))
}

function randomAttribute(attributes: Node[]): Node
function randomAttribute(attributes: Node[], count: number): Node[]
function randomAttribute(attributes: Node[], count?: number): Node | Node[] {
    let returnMulti = true
    if (count === undefined) {
        count = 1
        returnMulti = false
    }
    const samples = []
    for (let i = 0; i < count; i++) {
        const sample = Math.floor(Math.random() * attributes.length)
        samples.push(attributes[sample])
    }
    return returnMulti ? samples : samples[0]
}

function randomObligationClass(): Node {
    return DATAPOL['test-obligation-class']
}

function randomActivationCondition(store: Store, attributes: Node[]) {
    const quadProtos: QuadProto[] = []
    const nodeAC = blankNode()
    quadProtos.push([nodeAC, DTOU.purpose3, randomClass(store, attributes)])
    return { node: nodeAC, quads: quadProtos }
}

function genAttributes(num: number): GenAttributesOutput {
    const nodeListAttribute = []
    const quadListAttribute = []
    for (let i = 0; i < num; i++) {
        const nodeAttribute = blankNode()
        nodeListAttribute.push(nodeAttribute)
        quadListAttribute.push(
            ...[
                quad(nodeAttribute, A, DTOU.Attribute),
                quad(nodeAttribute, DTOU.name, randomName(false)),
                quad(nodeAttribute, DTOU.class, randomClass(false, true)),
                quad(nodeAttribute, DTOU.value, randomValue(false, true))
            ]
        )
    }
    return {
        attributes: nodeListAttribute,
        quads: quadListAttribute
    }
}

function genTags(
    attributes: Node[],
    numSecurity: number = 0,
    numIntegrity: number = 0,
    numPurpose: number = 0,
    numBinding: number = 0
): GenTagsOutput {
    if (attributes.length < numBinding) {
        // Unexpected, but change this to allow proceeding.
        numBinding = attributes.length
    }

    const tags: TagNodes = {
        security: [],
        integrity: [],
        purpose: []
    }
    //   const tags0: Node[] = [];
    const quads: Quad[] = []

    const genTypeTag = function (count: number, tagType: NamedNode, saveTo: Node[]) {
        for (let i = 0; i < count; i++) {
            const nodeTag = blankNode()
            // tags0.push(nodeTag);
            saveTo.push(nodeTag)
            quads.push(quad(nodeTag, A, tagType))
            quads.push(quad(nodeTag, DTOU.attribute_ref, randomAttribute(attributes)))
            const validityBindings = randomAttribute(attributes, numBinding)
            for (let j = 0; j < numBinding; j++) {
                quads.push(quad(nodeTag, DTOU.validity_binding, validityBindings[j]))
            }
        }
    }

    genTypeTag(numSecurity, DTOU.Security, tags.security)
    genTypeTag(numIntegrity, DTOU.Integrity, tags.integrity)
    genTypeTag(numPurpose, DTOU.Purpose, tags.purpose)

    return { tags, quads }
}

// // Prohibition does not have a very intuitive usage, because of propagation. Need to rethink.
// function genProhibition(attributes: Node[], count: number, numBinding: number = 0) {
//     const prohibitions = [];
//     const quads = [];
//     for (let i = 0; i < count; i++) {
//         const nodeProhibition = blankNode();
//         prohibitions.push(nodeProhibition);
//         quads.push(quad(nodeProhibition, A, DTOU.Prohibition));
//         quads.push(quad(nodeProhibition, ))
//     }
// }

function genObligation(
    store: Store,
    writer: Writer,
    attributes: Node[],
    count: number,
    numArgs: number = 0,
    numBinding: number = 0
): GenObligationsOutput {
    const obligations = []
    const quadProtos: QuadProtoExtended[] = []
    for (let i = 0; i < count; i++) {
        const nodeObligation = blankNode()
        obligations.push(nodeObligation)
        quadProtos.push([nodeObligation, A, DTOU.Obligation])
        quadProtos.push([nodeObligation, DTOU.obligation_class, randomObligationClass()])
        const argAttrs = randomAttribute(attributes, numArgs)
        const argList = writer.list(argAttrs)
        quadProtos.push([nodeObligation, DTOU.argument, argList])
        const outAC = randomActivationCondition(store, attributes)
        quadProtos.push(...outAC.quads)
        quadProtos.push([nodeObligation, DTOU.activation_condition, outAC.node])
        const validityBindings = randomAttribute(attributes, numBinding)
        for (let j = 0; j < numBinding; j++) {
            quadProtos.push([nodeObligation, DTOU.validity_binding, validityBindings[j]])
        }
    }
    return { obligations, quadProtos }
}

// async function genDataPolicy(options: {
//     attribute: {
//         num: number,
//     },
//     tag: {
//         numSecurity?: number,
//         numPurpose?: number,
//         numIntegrity?: number,
//         numBinding?: number,
//     }
//     obligation?: {
//         num?: number,
//         numArg?: number,
//         numBinding?: number,
//     }
// } = {
//     attribute: {
//         num: 3,
//     },
//     tag: {
//         numSecurity: 1,
//     },
//     obligation: {
//         num: 3,
//         numArg: 2,
//         numBinding: 1
//     },
// }): Promise<[(QuadProtoExtended | Quad)[], Node]> {
// async function genDataPolicy({
//     attribute = {
//         num: 3,
//     },
//     tag = {
//         numSecurity: 1,
//     },
//     obligation = {
//         num: 3,
//         numArg: 2,
//         numBinding: 1
//     },
// }: OptionsGenDataPolicy): Promise<[(QuadProtoExtended | Quad)[], Node]> {
async function genDataPolicy({
    attribute,
    tag,
    obligation,
}: OptionsGenDataPolicyReal): Promise<[(QuadProtoExtended | Quad)[], Node]> {
    const store = new Store() // To store attributes for quicker look up, for attribute classes, etc
    const triples: (QuadProtoExtended | Quad)[] = []
    const writer = iWriter()
    const outputAttr = genAttributes(attribute.num)
    store.addQuads(outputAttr.quads)
    const outputTag = genTags(
        outputAttr.attributes,
        tag.numSecurity,
        tag.numIntegrity,
        tag.numPurpose,
        tag.numBinding
    )
    store.addQuads(outputTag.quads)
    const outputObligation = genObligation(store, writer, outputAttr.attributes, obligation.num, obligation.numArg, obligation.numBinding)
    for (const quadProto of outputObligation.quadProtos) {
        store.addQuad(...quadProto)
    }

    const nodePolicy = blankNode()
    triples.push([nodePolicy, A, DTOU.DataPolicy])
    for (const attr of outputAttr.attributes) {
        triples.push([nodePolicy, DTOU.attribute, attr])
    }
    for (const tag of outputTag.tags.security) {
        triples.push([nodePolicy, DTOU.requirement, tag])
    }
    for (const tag of outputTag.tags.integrity) {
        triples.push([nodePolicy, DTOU.tag, tag])
    }
    for (const tag of outputTag.tags.purpose) {
        triples.push([nodePolicy, DTOU.tag, tag])
    }
    for (const obligation of outputObligation.obligations) {
        triples.push([nodePolicy, DTOU.obligation, obligation])
    }
    ;[outputAttr.quads, outputTag.quads, outputObligation.quadProtos].forEach((arg) => {
        triples.push(...arg)
    })

    return [triples, nodePolicy]
}

export async function genDataAndPolicy(
    count: number,
    {
        attribute = {
            num: 3
        },
        tag = {
            numSecurity: 1
        },
        obligation = {
            num: 3,
            numArg: 2,
            numBinding: 1
        }
    }: OptionsGenDataPolicy
): Promise<DataPolicySet> {
    const result: DataPolicySet = []
    for (let i = 0; i < count; i++) {
        const writer = iWriter()
        const dataUrl = iDataUrl(i)
        const nodeData = DATAPOL[`data${i}`]
        const [triples, nodePolicy] = await genDataPolicy({attribute, tag, obligation})
        for (const triple of triples) {
            if (Array.isArray(triple)) {
                writer.addQuad(...triple)
            } else {
                writer.addQuad(triple)
            }
        }

        writer.addQuad(nodeData, A, DTOU.Data)
        writer.addQuad(nodeData, DTOU.uri, namedNode(dataUrl))
        writer.addQuad(nodeData, DTOU.policy, nodePolicy)
        const stringPolicy = await getResultAsString(writer)

        result.push({ url: dataUrl, policy: stringPolicy })
    }

    return result
}

function genExpects(count: number): GenTaggingOutput {
    const nodes = []
    const triples: QuadProto[] = []
    for (let i = 0; i < count; i++) {
        const nodeExpect = APPPOL[`appExpect${i}`]
        nodes.push(nodeExpect)
        triples.push([nodeExpect, A, DTOU.IntegrityExpectation])
        triples.push([nodeExpect, DTOU.name, randomClass(true)])
    }
    return { nodes, triples }
}

function genPurpose(count: number): GenTaggingOutput {
    const nodes = []
    const triples: QuadProto[] = []
    for (let i = 0; i < count; i++) {
        const nodePurpose = APPPOL[`appPurpose${i}`]
        nodes.push(nodePurpose)
        triples.push([nodePurpose, A, DTOU.PurposeExpectation])
        triples.push([nodePurpose, DTOU.name, randomClass(true)])
    }
    return { nodes, triples }
}

function genSecurity(count: number) {
    const nodes = []
    const triples: QuadProto[] = []
    for (let i = 0; i < count; i++) {
        const nodeProvide = APPPOL[`appSecurity${i}`]
        nodes.push(nodeProvide)
        triples.push([nodeProvide, A, DTOU.SecurityProvide])
        triples.push([nodeProvide, DTOU.name, randomClass(true)])
    }
    return { nodes, triples }
}

function genInput(count: number, {numIntegrity = 1, numPurpose = 1, numSecurity = 1}: OptionsGenInputSpec) {
    const nodes = []
    const triples: QuadProto[] = []

    const handleTagging = (nodeInput: Node, p_type: Quad_Predicate, output: GenTaggingOutput) => {
        triples.push(...output.triples)
        for (const node of output.nodes) {
            triples.push([nodeInput, p_type, node])
        }
    }

    for (let i = 0; i < count; i++) {
        const nodeInput = APPPOL[`inputSpec${i}`]
        nodes.push(nodeInput)
        triples.push([nodeInput, A, DTOU.InputSpec])
        const nodeInputPort = APPPOL[`inputPort${i}`]
        triples.push([nodeInputPort, A, DTOU.Port])
        triples.push([nodeInputPort, DTOU.name, literal(iInputPortName(i))])
        triples.push([nodeInput, DTOU.data, namedNode(iDataUrl(i))])
        handleTagging(nodeInput, DTOU.expect, genExpects(numIntegrity))
        handleTagging(nodeInput, DTOU.purpose2, genPurpose(numPurpose))
        handleTagging(nodeInput, DTOU.provide, genSecurity(numSecurity))
    }

    return { nodes, triples }
}

export interface OptionsGenOutputSpec {
    numInput: number,
    // numEdit: number,
    numDelete: number,
}

function genOutput(numOutput: number, genOutputSpecOptions: OptionsGenOutputSpec) {
    const nodes = []
    const triples: QuadProto[] = []

    for (let i = 0; i < numOutput; i++) {
        const nodeOutputSpec = APPPOL[`outputSpec${i}`]
        nodes.push(nodeOutputSpec)
        triples.push([nodeOutputSpec, A, DTOU.OutputSpec])
        const nodeOutputPort = APPPOL[`outputPort${i}`]
        triples.push([nodeOutputPort, A, DTOU.Port])
        triples.push([nodeOutputPort, DTOU.name, literal(iOutputPortName(i))])
        for (let j = 0; j < genOutputSpecOptions.numInput; j++) {
            triples.push([nodeOutputSpec, DTOU.from, APPPOL[`inputSpec${i}`]])
        }
        for (let j = 0; j < genOutputSpecOptions.numDelete; j++) {
            const nodeRefinementDelete = blankNode()
            triples.push([nodeOutputSpec, DTOU.refinement, nodeRefinementDelete])
            triples.push([nodeRefinementDelete, A, DTOU.Delete])
            const nodeFilter = blankNode()
            triples.push([nodeRefinementDelete, DTOU.filter, nodeFilter])
            triples.push([nodeFilter, A, DTOU.Filter])
            triples.push([nodeFilter, DTOU.name, randomName(true)])
            triples.push([nodeFilter, DTOU.class, randomClass(true)])
            triples.push([nodeFilter, DTOU.value, randomValue(true)])
        }
    }
    return { nodes, triples }
}

export function genAppPolicy(numInput: number, genInputSpecOptions: OptionsGenInputSpec, numOutput: number, genOutputSpecOptions: OptionsGenOutputSpec, dataPolicyStore?: Store) {
    const writer = iWriter()
    const triples: QuadProto[] = []

    const nodeAppPol = APPPOL[`appPolicy1`]
    triples.push([nodeAppPol, A, DTOU.AppPolicy])
    triples.push([nodeAppPol, DTOU.name, namedNode(APP_NAME)])
    triples.push([nodeAppPol, DTOU.action, APP_ACTION])
    const outputInput = genInput(numInput, genInputSpecOptions)
    triples.push(...outputInput.triples)
    for (const nodeInput of outputInput.nodes) {
        triples.push([nodeAppPol, DTOU.input_spec, nodeInput])
    }
    const outputOutput = genOutput(numOutput, genOutputSpecOptions)
    triples.push(...outputOutput.triples)
    for (const nodeOutput of outputOutput.nodes) {
        triples.push([nodeAppPol, DTOU.output_spec, nodeOutput])
    }

    // for (const triple of triples) {
    //     writer.addQuad(...triple)
    // }
    const store = new Store();
    for (const triple of triples) {
        store.addQuad(...triple)
    }
    writer.addQuads(store.getQuads(null, null, null, null))

    return getResultAsString(writer)
}

// export async function testGenerate() {
//     const result = await genDataAndPolicy(2, {})
//     const result2 = await genAppPolicy({
//         count: 2,
//         numExpect: 20,
//         numPurpose: 20,
//         numSecurity: 20,
//     })
//     return [result, result2]
// }

// async function testList() {
//     const store = new Store()
//     const writer = new Writer({
//         prefix: {
//             dtou: IRI_DTOU
//         }
//     })
//     const quads: QuadProtoExtended[] = [];
//     const nodes = [ namedNode('arg1'), namedNode('arg2') ];
//     for (const node of nodes) {
//         // store.addQuad(node, A, DTOU.Thing);
//         quads.push([node, A, DTOU.Thing])
//     }
//     const oList = writer.list(nodes);
//     store.addQuad(namedNode('node1'), DTOU.has, oList);
//     quads.push([namedNode('node1'), DTOU.has, oList])
//     // writer.addQuads(store.getQuads(null, null, null, null))
//     for (const quad of quads) {
//         writer.addQuad(...quad)
//     }
//     writer.end((error: any, result: string) => {
//         if (error) {
//             console.error("testList", error);
//         }
//         console.log("testList", result)
//     })
// }
