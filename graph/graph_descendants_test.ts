import { ArrowGraphHashed } from "https://deno.land/x/rimbu@1.2.0/graph/mod.ts"

import { assertEquals } from "../test_deps.ts"
import { graphDescendants } from "./graph_descendants.ts"

Deno.test("graphDescendants() gets all valid path of directed graph", () => {
	const graph = ArrowGraphHashed.of(
		["a", "A"],
		["A", "TOP1"],
		["b", "A"],
		["a", "B"],
		["B", "TOP2"],
		["c", "B"],
	)

	const result = graphDescendants(graph)

	const expected = {
		TOP1: ["b", "A", "a"],
		TOP2: ["a", "B", "c"],
	}

	assertEquals(result, expected)
})
