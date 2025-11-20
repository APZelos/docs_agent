import {Schema as S} from "effect"

import {model} from "../concave"

export const User = model("user", S.Struct({name: S.String}))
