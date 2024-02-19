import {
	ResolutionHostFactory,
	ts,
} from "https://deno.land/x/ts_morph@21.0.1/mod.ts"

export const deno: ResolutionHostFactory = (
	moduleResolutionHost,
	getCompilerOptions,
) => {
	const compilerOptions = getCompilerOptions()
	return {
		resolveModuleNames: (moduleNames, containingFile) => {
			const res = moduleNames
				.map((moduleName) =>
					ts.resolveModuleName(
						moduleName,
						containingFile,
						compilerOptions,
						moduleResolutionHost,
						/*cache*/ undefined,
						/*redirectedReference*/ undefined,
						/*resolutionMode*/ ts.ModuleKind.ESNext,
					)
				)
				.map((result) => result.resolvedModule)
			return res
		},
	}
}
