import {
	type CompilerOptions,
	type ProjectOptions,
	ts,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import { FilteredFSHost } from "../graph/fs.ts"

const ignore = /http|npm:|node_modules|\.jsx?|\.d\.ts/

export const denoCompilerOptions: CompilerOptions = {
	target: ts.ScriptTarget.ESNext,
	module: ts.ModuleKind.ESNext,
	moduleResolution: ts.ModuleResolutionKind.NodeNext,
	strict: true,
	allowJs: false,
	checkJs: false,
	allowImportingTsExtensions: true,
	skipLibCheck: true,
	types: [],
	lib: [],
}

export const denoProjectOption: ProjectOptions = {
	skipLoadingLibFiles: true,
	compilerOptions: denoCompilerOptions,
	fileSystem: new FilteredFSHost((path) => ignore.test(path)),
}
