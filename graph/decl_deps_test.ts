import { inMemoryProject, withSrc } from "./_project.ts"
import { exampleSrc } from "./_example_project.ts"
import { asRecord, declDepsSerializer, getDeclDeps } from "./decl_deps.ts"
import { assertEquals, assertSnapshot } from "../test_deps.ts"
import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { getAllDecls } from "./decls.ts"

const project = inMemoryProject()
const src = withSrc(project)(exampleSrc)

Deno.test("getDeclDeps() recursively searches (aliased) references in other files", () => {
	const { "a.ts": a } = src
	const aDecl = a.getVariableDeclarationOrThrow("a")
	const declDeps = getDeclDeps([aDecl])
	const result = asRecord((x) => x.getName() ?? x.getText())(declDeps)
	console.log(result)

	assertEquals(result, {
		a: new Set(["Comp", "AliasedImport"]),
		Page: new Set(["InnerImport"]),
		Comp: new Set(["Page"]),
		InnerImport: new Set([]),
		AliasedImport: new Set([]),
	})
})

Deno.test("getDeclDeps() handles identical export names", async (t) => {
	const decls = Stream.fromObjectValues(src).flatMap(getAllDecls).toArray()
	const declDeps = getDeclDeps(decls)
	console.log(`serialized: <<<${declDepsSerializer(declDeps)}>>>`)
	await assertSnapshot(t, declDeps, { serializer: declDepsSerializer })
})
