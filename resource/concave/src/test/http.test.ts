import {Schema as S} from "effect"
import {describe, expect, test} from "vitest"

import {setup} from "./setup"

async function json<Output, Input>(res: Response, schema: S.Schema<Output, Input>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = await res.json()
  return S.decodeUnknownPromise(schema)(body)
}

describe("http", () => {
  test("simple", async () => {
    const {t} = setup()
    const res = await t.fetch("/", {method: "POST"})

    expect(res.status).toBe(200)

    const body = await json(res, S.Struct({name: S.String}))
    expect(body.name).toBe("Joe")
  })
})
