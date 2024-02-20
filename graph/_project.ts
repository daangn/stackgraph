import { Reducer, Stream } from "https://deno.land/x/rimbu@1.2.0/stream/mod.ts"
import { Project, SourceFile } from "../deps/ts_morph.ts"
import { denoCompilerOptions } from "../utils/project.ts"

/** In-Memory ESM Project for quick testing */
export const inMemoryProject = () =>
	new Project({
		compilerOptions: denoCompilerOptions,
		useInMemoryFileSystem: true,
	})

/**
 * Add source files to in-memory project
 */
export const withSrc =
	(project: Project) =>
	<const T extends string>(src: Record<T, string>): Record<T, SourceFile> =>
		Stream.fromObject(src)
			.map(([path, text]) =>
				[path, project.createSourceFile(path, text)] as const
			)
			.reduce(Reducer.toJSObject())
