import { inMemoryProject, withSrc } from "./_project.ts"
import { exampleSrc } from "./_example_project.ts"
import { asNameRecord, getDeclDeps } from "./decl_deps.ts"
import { assertEquals } from "../test_deps.ts"

const project = inMemoryProject()
const { "a.ts": a } = withSrc(project)(exampleSrc)

const aDecl = a.getVariableDeclarationOrThrow("a")
const declDeps = getDeclDeps([aDecl])
const result = asNameRecord(declDeps)

Deno.test("getDeclDeps() finds references to other files", () => {
	assertEquals(result, {
		a: new Set(["Comp", "AliasedImport"]),
		Page: new Set(["InnerImport"]),
		Comp: new Set(["Page"]),
		InnerImport: new Set([]),
		AliasedImport: new Set([]),
	})
})
