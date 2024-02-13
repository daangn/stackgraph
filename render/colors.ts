import { crypto } from "https://deno.land/std@0.215.0/crypto/mod.ts"

const toYIQ = ({ r, g, b }: Record<"r" | "g" | "b", number>) =>
	0.299 * r + 0.587 * g + 0.114 * b

const encoder = new TextEncoder()
const hashInner = (str: string) => {
	const hash = crypto.subtle.digestSync("SHA-1", encoder.encode(str))
	return new Uint8Array(hash)
}

/** hashes string with SHA-1 */
export const hash = (str: string): string => {
	const hash = hashInner(str)
	return Array.from(hash).map((n) => n.toString(16).padStart(2, "0")).join("")
}

export const hashRGB = (str: string) => {
	const [r, g, b] = hashInner(str).slice(0, 3)
	return { r, g, b }
}

export const colors = ({ r, g, b }: Record<"r" | "g" | "b", number>) =>
	({
		color: `rgba(${r}, ${g}, ${b}, 0.8)`,
		textColor: toYIQ({ r, g, b }) > 128 ? "black" : "white",
	}) as const
