import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { inMemoryProject } from "./_project.ts"

/**
 * https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements
 *
 * Example file of all top-level javascript declarations
 */
export const declExampleText = (h: string | number = "") => /*javascript*/ `
    // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements#declaring_variables
    export var varVar${h} = 1
    export var varVarIgnore${h} = 2

    export let varLet${h} = 1
    export let varLetIgnore${h} = 2

    export const varConst${h} = 1
    export const varConstIgnore${h} = 2

    export const varArrowFn${h} = () => {}
    export const varArrowFnIgnore${h} = () => {}

    // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements#functions_and_classes
    export function functionFn${h}() {}
    export function functionFnIgnore${h}() {}

    export function${h}* functionGen() {}
    export function${h}* functionGenIgnore() {}

    export async function${h} functionAsync() {}
    export async function${h} functionAsyncIgnore() {}

    export async function${h}* functionAsyncGen() {}
    export async function${h}* functionAsyncGenIgnore() {}

    export class Class${h} {}
    export class ClassIgnore${h} {}

    // others
    if (true) {
        const variableInIf${h} = 3
    }
`

/**
 * Arbitarily large file with many declarations for benchmarking
 */
export const getDeclExampleFile = (amount: number) => {
	const project = inMemoryProject()

	const text = Stream
		.range({ amount }).map(declExampleText).join({ sep: "\n\n" })

	return project.createSourceFile("a.ts", text)
}
