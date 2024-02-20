import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { assertEquals } from "../test_deps.ts"
import { declExampleText, exampleSrc } from "./_example_project.ts"
import { inMemoryProject, withSrc } from "./_project.ts"
import { getAllDecls } from "./decls.ts"
import { encodeVSCodeURI, mkDecodeVSCodeURI } from "./vscode_uri.ts"

const project = inMemoryProject()

const src = withSrc(project)({
	...exampleSrc,
	"decls.ts": declExampleText(),
	"complex.ts": /*javascript*/ `
        export
            const Foo =
                () => (
                    <div>
                        <h1>Foo</h1>
                    </div>
        )
    `,
})

const decodeVSCodeURI = mkDecodeVSCodeURI(project)
const aDecl = src["a.ts"].getVariableDeclarationOrThrow("a")
const aURI = encodeVSCodeURI(aDecl)

Deno.test("encodeVSCodeURI() encodes to valid URL", () => {
	const expected = new URL("vscode://file/a.ts:2:22?kind=VariableDeclaration")

	assertEquals(new URL(aURI), expected)
})

Deno.test("decodeVSCodeURI() decodes to valid Node", () => {
	const node = decodeVSCodeURI(aURI)

	assertEquals(node?.getKindName(), "VariableDeclaration")
	assertEquals(node?.getText(), `a = "a"`)
})

Deno.test("decodeVSCodeURI() and encodeVSCodeURI() is idempotent", () =>
	Stream.fromObjectValues(src).flatMap(getAllDecls).forEach((decl) => {
		const url = encodeVSCodeURI(decl)
		const node = decodeVSCodeURI(url)
		assertEquals(
			node,
			decl,
			`${node?.getSourceFile().getFilePath()}: ${node?.getText()} (${url}) !== ${decl.getText()}`,
		)
	}))
