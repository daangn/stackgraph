import { inMemoryProject, withSrc } from "./_project.ts"
import { exampleSrc } from "./_example_project.ts"
import { assertSnapshot } from "../test_deps.ts"
import { Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { getAllDecls } from "./decls.ts"
import { asRecord, declDepsSerializer, serializeNoColor } from "./_format.ts"
import { snapshotTest } from "./_snapshot.ts"
import { getDeclDeps } from "./decl_deps.ts"

const project = inMemoryProject()
const src = withSrc(project)(exampleSrc)

snapshotTest(
	"getDeclDeps() searches (aliased) references for a",
	async (t) => {
		const { "a.ts": a } = src
		const aDecl = a.getVariableDeclarationOrThrow("a")
		const declDeps = getDeclDeps([aDecl])
		const result = asRecord((x) => x.getName() ?? x.getText())(declDeps)

		await assertSnapshot(t, result, { serializer: serializeNoColor })
	},
)

snapshotTest("getDeclDeps() handles identical export names", async (t) => {
	const decls = Stream.fromObjectValues(src).flatMap(getAllDecls).toArray()
	const declDeps = getDeclDeps(decls)

	await assertSnapshot(t, declDeps, { serializer: declDepsSerializer })
})
