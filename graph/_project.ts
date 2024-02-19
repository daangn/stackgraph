import { Project } from "../deps/ts_morph.ts"
import { denoCompilerOptions } from "../utils/project.ts"

export const inMemoryProject = () =>
	new Project({
		compilerOptions: denoCompilerOptions,
		useInMemoryFileSystem: true,
	})
