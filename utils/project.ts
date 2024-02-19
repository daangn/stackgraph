import { ProjectOptions, ts } from "https://deno.land/x/ts_morph@21.0.1/mod.ts"
import { FilteredFSHost } from "../graph/fs.ts"

const ignore = /http|npm:|node_modules|\.jsx?|\.d\.ts/
export const denoProjectOption: ProjectOptions = {
	skipLoadingLibFiles: true,
	compilerOptions: {
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
	},
	fileSystem: new FilteredFSHost((path) => ignore.test(path)),
}
