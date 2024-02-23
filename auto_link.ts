import Site from "lume/core/site.ts"

const urlRe = /(<span.*>.*)(https:.+)(<\/.*>)/g
const replace = (x: string) => x.replace(urlRe, `$1<a href="$2">$2</a>$3`)

export const codeAutoLink = (replaceFn = replace) => (site: Site) =>
	site.process([".html"], (pages) => {
		pages.forEach((page) => {
			if (typeof page.content !== "string") return
			page.content = replaceFn(page.content)
		})
	})
