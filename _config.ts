import lume from "lume/mod.ts"
import codeHighlight from "lume/plugins/code_highlight.ts"
import relativeUrls from "lume/plugins/relative_urls.ts"
import { codeAutoLink } from "./auto_link.ts"

const site = lume({ src: "doc", prettyUrls: false })

site.copy("assets", "assets")

site
	.use(codeHighlight())
	.use(codeAutoLink())
	.use(relativeUrls())

export default site
