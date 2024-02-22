import lume from "lume/mod.ts"
import codeHighlight from "lume/plugins/code_highlight.ts"

const site = lume({ src: "doc", prettyUrls: false })

site.copy("assets", "assets")

site.use(codeHighlight())

export default site
