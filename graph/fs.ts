import { RealFileSystemHost } from "https://deno.land/x/ts_morph@21.0.1/common/mod.ts"

export class FilteredFSHost extends RealFileSystemHost {
	constructor(readonly ignore: (path: string) => boolean) {
		super()
	}

	override fileExists(filePath: string): Promise<boolean> {
		if (this.ignore(filePath)) return Promise.resolve(false)
		return super.fileExists(filePath)
	}
	override fileExistsSync(filePath: string): boolean {
		if (this.ignore(filePath)) return false
		return super.fileExistsSync(filePath)
	}
	override directoryExists(dirPath: string): Promise<boolean> {
		if (this.ignore(dirPath)) return Promise.resolve(false)
		return super.directoryExists(dirPath)
	}
	override directoryExistsSync(dirPath: string): boolean {
		if (this.ignore(dirPath)) return false
		return super.directoryExistsSync(dirPath)
	}
}
