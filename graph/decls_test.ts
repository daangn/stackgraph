import type { Declaration } from "./decl_deps.ts"
import { getDecls } from "./decls.ts"
import { declExampleText } from "./_example_project.ts"
import { inMemoryProject } from "./_project.ts"
import { assertSnapshot } from "../test_deps.ts"
import { serializeNoColor } from "./_format.ts"
import { snapshotTest } from "./_snapshot.ts"

snapshotTest("getInitialDecls() filters by declaration name", async (t) => {
	const project = inMemoryProject()

	const file = project.createSourceFile("a.ts", declExampleText())
	const filter = (node: Declaration) =>
		!node.getName()?.toLowerCase().endsWith("ignore")

	const decls = getDecls(filter)([file]).map((x) => x.getName()).toArray()

	await assertSnapshot(t, decls, { serializer: serializeNoColor })
})
