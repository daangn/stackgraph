import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { assertSnapshot } from "../test_deps.ts"
import { exampleSrc } from "./_example_project.ts"
import { inMemoryProject, withSrc } from "./_project.ts"
import { getDeclDeps } from "./decl_deps.ts"
import { getAllDecls } from "./decls.ts"
import { declDepsToGraph } from "./graph.ts"
import { getTopDeclDeps } from "./top_decl_deps.ts"
import { snapshotTest } from "./_snapshot.ts"

snapshotTest(
	"getTopDeclDeps() converts graph into valid TopDeclDeps",
	async (t) => {
		const project = inMemoryProject()
		const files = withSrc(project)(exampleSrc)
		const decls = Stream.fromObjectValues(files).flatMap(getAllDecls).toArray()
		const declDeps = getDeclDeps(decls)
		const graph = declDepsToGraph(declDeps)

		const topDeclDeps = getTopDeclDeps(graph)

		await assertSnapshot(t, topDeclDeps)
	},
)
