const read = await Deno.permissions.query({ name: "read" })

const ignore = read.state !== "granted"

/**
 * same as `Deno.test` but skipped if `read` permission is denied
 */
export const snapshotTest = (
	name: Deno.TestDefinition["name"],
	fn: Deno.TestDefinition["fn"],
) => Deno.test({ name, ignore, fn })
