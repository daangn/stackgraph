import lume from "lume/mod.ts"

const site = lume({ src: "doc" })

site.copy("assets", "assets")

export default site
