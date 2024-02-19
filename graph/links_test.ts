import type { Declaration } from "../graph/deps_map.ts"
import { getDecls } from "../graph/links.ts"
import { assertEquals } from "https://deno.land/std@0.216.0/assert/assert_equals.ts"
import { declExampleText } from "./_example_project.ts"
import { inMemoryProject } from "./_project.ts"

Deno.test("getInitialDecls() filters by declaration name", () => {
	const project = inMemoryProject()

	const file = project.createSourceFile("a.ts", declExampleText())
	const filter = (node: Declaration) =>
		!node.getName()?.toLowerCase().endsWith("ignore")

	const decls = getDecls(filter)([file]).map((x) => x.getName()).toArray()

	const expected = [
		"varVar",
		"varLet",
		"varConst",
		"varArrowFn",
		"functionFn",
		"functionGen",
		"functionAsync",
		"functionAsyncGen",
		"Class",
	]
	assertEquals(decls, expected)
})
