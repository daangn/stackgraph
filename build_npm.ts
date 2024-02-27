import { build, emptyDir } from "https://deno.land/x/dnt@0.40.0/mod.ts"

const dir = "./npm"

await emptyDir(dir)
await build({
	entryPoints: ["./graph/mod.ts"],
	outDir: dir,
	shims: {
		deno: "dev",
	},
	test: false,
	mappings: {
		"https://deno.land/x/rimbu@1.2.0/stream/mod.ts": {
			name: "@rimbu/stream",
			version: "2.1.0",
		},
		"https://deno.land/x/rimbu@1.2.0/hashed/mod.ts": {
			name: "@rimbu/hashed",
			version: "2.1.0",
		},
		"https://deno.land/x/rimbu@1.2.0/graph/mod.ts": {
			name: "@rimbu/graph",
			version: "2.0.1",
		},
		"https://deno.land/x/rimbu@1.2.0/graph/custom/common/link.ts": {
			name: "@rimbu/graph",
			version: "2.0.1",
			subPath: "custom",
		},
		"https://deno.land/x/ts_morph@21.0.1/mod.ts": {
			name: "ts-morph",
			version: "21.0.1",
		},
		"https://deno.land/x/ts_morph@21.0.1/common/mod.ts": {
			name: "@ts-morph/common",
			version: "0.22.0",
		},
	},
	// scriptModule: false,
	package: {
		name: "stackgraph",
		version: "0.0.0",
		description: "(stacked) dependency graph visualizer",
		license: "MIT",
		repository: {
			type: "git",
			url: "git+https://github.com/daangn/stackgraph.git",
		},
		bugs: {
			url: "https://github.com/daangn/stackgraph/issues",
		},
	},
	postBuild: async () => {
		await Promise.all([
			Deno.copyFile("./README.md", `${dir}/README.md`),
			Deno.copyFile("./LICENSE", `${dir}/LICENSE`),
		])
	},
})
