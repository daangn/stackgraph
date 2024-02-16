import { distinct } from "https://deno.land/std@0.215.0/collections/distinct.ts"

import type { Flows } from "./data.ts"

export const toUl = (xs: string[]) => {
	const ys = xs.map((x) => /*html*/ `<li>${x}</li>`).join("\n")
	return /*html*/ `<ul>${ys}</ul>`
}
export type LabelOption = {
	flows: Flows
	clicks: Record<string, string[]>
	shows: Record<string, string[]>
}

export const mkToLabel =
	({ flows, clicks, shows }: LabelOption) => (name: string) => {
		const pushes = distinct(
			flows[name].filter(({ type }) => type === "push").map(({ to }) => to),
		)
		const replaces = distinct(
			flows[name].filter(({ type }) => type === "replace").map(({ to }) => to),
		)

		return /*html*/ `
<h2>${name}</h2>
<section>
    <h3>logShowEvent (x${shows[name]?.length})</h3>
    ${toUl(shows[name])}
</section>
<section>
    <h3>logClickEvent (x${clicks[name]?.length})</h3>
    ${toUl(clicks[name])}
</section>
<section>
    <h3>Pushes (x${pushes.length})</h3>
    ${toUl(pushes)}
</section>
<section>
    <h3>Replaces (x${replaces.length})</h3>
    ${toUl(replaces)}
</section>
`
	}
