// deno-lint-ignore no-unused-vars
import { Node, Project, type SourceFile, ts } from "../deps/ts_morph.ts"
import { typedRegEx } from "https://deno.land/x/typed_regex@0.2.0/mod.ts"

/**
 * extended [VSCode URL](https://code.visualstudio.com/docs/editor/command-line#_opening-vs-code-with-urls)
 * format to uniquely identify {@link Node} in {@link SourceFile}.
 *
 * format: `VSCode URL` + `kind` query parameter
 *
 * @privateRemarks
 *
 * RFC: encode project source file commit SHA for validation?
 */
export type VSCodeURI = `vscode://file/${string}?kind=${string}`

/** Encode {@link Node} into {@link VSCodeURI} */
export const encodeVSCodeURI = (node: Node): VSCodeURI => {
	const srcfile = node.getSourceFile()
	const path = srcfile.getFilePath().replace("/", "")

	const { line, column } = srcfile.getLineAndColumnAtPos(node.getStart())

	// console.log(node.getStart(), node.getText(), {
	// 	line,
	// 	column,
	// 	kind: node.getKindName(),
	// })

	return `vscode://file/${path}:${line}:${column}?kind=${node.getKindName()}`
}

/**
 * Decode {@link VSCodeURI} into {@link Node}
 *
 * The project used to decode the URI must have
 * identical source file state to the project used to encode the URI.
 */
export const mkDecodeVSCodeURI =
	(project: Project) => (url: VSCodeURI): Node | undefined => {
		const kind = new URL(url).searchParams.get("kind")

		if (!kind || !isValidSyntaxKind(kind)) return undefined
		const syntaxKind = ts.SyntaxKind[kind]

		const match = vscodeURIPattern.captures(url)
		if (!match) return undefined

		const { path, line, column } = match

		const srcfile = project.getSourceFile(path)
		if (!srcfile) return undefined

		// https://github.com/dsherret/ts-morph/issues/891#issuecomment-847972520
		const pos = srcfile.compilerNode
			.getPositionOfLineAndCharacter(+line - 1, +column - 1) // 1-indexed to 0-indexed

		// console.log({
		// 	pos,
		// 	line,
		// 	column,
		// 	kind,
		// 	child: srcfile.getDescendantAtPos(pos)?.getText(),
		// 	actual: srcfile.getDescendantAtPos(pos)?.getAncestors()
		// 		.find((x) => x.isKind(syntaxKind))?.getText(),
		// })

		return srcfile.getDescendantAtPos(pos)
			?.getAncestors().find((x) => x.isKind(syntaxKind))
	}

const vscodeURIPattern = typedRegEx(
	"vscode:\\/\\/file/(?<path>.+):(?<line>\\d+):(?<column>\\d+)",
)

const isValidSyntaxKind = (kind: string): kind is keyof typeof ts.SyntaxKind =>
	kind in ts.SyntaxKind
