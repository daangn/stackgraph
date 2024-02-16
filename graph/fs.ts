import { RealFileSystemHost } from "https://deno.land/x/ts_morph@21.0.1/common/mod.ts"

/**
 * Intercepts and skips file & directory lookup to speed up the process
 */
export class FilteredFSHost extends RealFileSystemHost {
	constructor(readonly ignore: (path: string) => boolean) {
		super()
	}

	override fileExists(path: string): Promise<boolean> {
		return this.ignore(path) ? Promise.resolve(false) : super.fileExists(path)
	}
	override fileExistsSync(path: string): boolean {
        // console.log("fileExistsSync", path)
		return this.ignore(path) ? false : super.fileExistsSync(path)
	}

	override directoryExists(path: string): Promise<boolean> {
		return this.ignore(path)
			? Promise.resolve(false)
			: super.directoryExists(path)
	}
	override directoryExistsSync(path: string): boolean {
		// console.log("directoryExistsSync", path)
		return this.ignore(path) ? false : super.directoryExistsSync(path)
	}
}
