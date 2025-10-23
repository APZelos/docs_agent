import type {
  GenericId,
  Validator,
  VAny,
  VArray,
  VBoolean,
  VBytes,
  VFloat64,
  VId,
  VInt64,
  VLiteral,
  VNull,
  VObject,
  VOptional,
  VRecord,
  VString,
  VUnion,
} from "convex/values"
import type {Brand} from "effect"
import type {IsAny, IsLiteral, IsUnion, UnionToTuple} from "src/lib/types"

import {v} from "convex/values"
import {Option, pipe, Schema as S, SchemaAST, String} from "effect"

import {ConvexTableName} from "src/model"

export function SDocId<TableName extends string>(
  tableName: TableName,
): S.Schema<GenericId<TableName>> {
  return pipe(S.String, S.annotations({[ConvexTableName]: tableName})) as any as S.Schema<
    GenericId<TableName>
  >
}

export function mapSchemaToValidator<Schema extends S.Schema.All>(
  schema: Schema,
): EncodedSchemaToValidator<S.Schema.Encoded<Schema>> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return mapAstToValidator(schema.ast) as any as EncodedSchemaToValidator<S.Schema.Encoded<Schema>>
}

function mapAstToValidator(ast: SchemaAST.AST, isOptionalProperty = false): AnyValidator {
  let validator: AnyValidator
  switch (ast._tag) {
    case "AnyKeyword":
      validator = v.any()
      break
    case "Union": {
      const memberValidators: AnyValidator[] = ast.types.map((memberAst) =>
        mapAstToValidator(memberAst),
      )
      validator = v.union(...memberValidators)
      break
    }
    case "Literal":
      validator = ast.literal === null ? v.null() : v.literal(ast.literal)
      break
    case "TupleType": {
      validator = mapAstTupleTypeToVArray(ast)
      break
    }
    case "TypeLiteral":
      validator = mapAstTypeLiteralToValidator(ast)
      break
    case "NumberKeyword":
      validator = v.number()
      break
    case "BigIntKeyword":
      validator = v.int64()
      break
    case "BooleanKeyword":
      validator = v.boolean()
      break
    case "StringKeyword": {
      const tableName = getTableNameAnnotationNullable(ast)
      validator = tableName ? v.id(tableName) : v.string()
      break
    }
    // TODO: Handle ArrayBuffer
    case "Refinement":
    case "Transformation":
      validator = mapAstToValidator(ast.from)
      break
    default:
      throw new Error(`Unsupported schema "${ast._tag}"`)
  }

  if (isOptionalProperty) {
    validator = v.optional(validator)
  }

  return validator
}

function mapAstTupleTypeToVArray(ast: SchemaAST.TupleType): AnyValidator {
  const validators: AnyValidator[] = []
  for (const element of ast.elements) {
    if (element.isOptional) {
      throw new Error("Convex doesn't suuport optional elements for tuples")
    }

    validators.push(mapAstToValidator(element.type))
  }

  for (const astType of ast.rest) {
    validators.push(mapAstToValidator(astType.type))
  }

  const [elementValidator, ...restValidators] = validators
  if (!elementValidator) {
    throw new Error("Array/Tuple schemas require at least one element schema")
  }
  if (restValidators.length === 0) {
    return v.array(elementValidator)
  }

  return v.array(v.union(elementValidator, ...restValidators))
}

function mapAstTypeLiteralToValidator(ast: SchemaAST.TypeLiteral): AnyValidator {
  const [indexSignature] = ast.indexSignatures
  if (indexSignature) {
    return mapIndexSignatureToVRecord(indexSignature)
  }

  return mapPropertySignaturesToVObject(ast.propertySignatures)
}

function mapIndexSignatureToVRecord(signature: SchemaAST.IndexSignature): AnyValidator {
  if (signature.parameter._tag !== "StringKeyword") {
    throw new Error(
      `Convex supports only strings for record keys, ${signature.parameter._tag} schema is not supported.`,
    )
  }

  const keyValidator = mapAstToValidator(signature.parameter)
  const valueValidator = mapAstToValidator(signature.type)

  return v.record(keyValidator, valueValidator)
}

function mapPropertySignaturesToVObject(
  signatures: readonly SchemaAST.PropertySignature[],
): AnyValidator {
  const fields: Record<string, AnyValidator> = {}

  for (const signature of signatures) {
    if (!String.isString(signature.name)) {
      throw new Error("Convex only supports string keys for objects")
    }

    let propertyAst: SchemaAST.AST
    if (signature.isOptional && signature.type._tag === "Union") {
      // When defining an optional property, e.g. S.Struct({name: S.optional(S.String)}),
      // this is transformed to a Union with undefined, e.g. S.Union(S.String, S.Undefined).
      propertyAst = signature.type.types[0]
    } else {
      propertyAst = signature.type
    }

    fields[signature.name] = mapAstToValidator(propertyAst, signature.isOptional)
  }

  return v.object(fields)
}
const getTableNameAnnotationOption = SchemaAST.getAnnotation<string>(ConvexTableName)

function getTableNameAnnotationNullable(ast: SchemaAST.AST) {
  return pipe(getTableNameAnnotationOption(ast), Option.getOrNull)
}

type AnyValidator = Validator<any, any, any>
type EncodedArray = readonly EncodedValue[]
type EncodedRecord = {readonly [key: string]: EncodedValue | undefined}
type EncodedValue =
  | EncodedArray
  | EncodedRecord
  | number
  | bigint
  | boolean
  | string
  | ArrayBuffer
  | null

export type EncodedSchemaToValidator<Value> =
  IsAny<Value> extends true ? VAny
  : IsUnion<Value> extends true ? UnionToValidator<Value>
  : IsDocId<Value> extends true ? DocIdToValidator<Value>
  : IsLiteral<Value> extends true ? VLiteral<Value>
  : Value extends EncodedArray ? ArrayToValidator<Value>
  : Value extends EncodedRecord ? RecordToValidator<Value>
  : Value extends number ? VFloat64
  : Value extends bigint ? VInt64
  : Value extends boolean ? VBoolean
  : Value extends string ? VString
  : Value extends ArrayBuffer ? VBytes
  : Value extends null ? VNull
  : never

type UnionToValidator<Value> =
  UnionToTuple<Value> extends infer Tuple extends readonly EncodedValue[] ?
    TupleToValidatorArray<Tuple> extends infer Validators extends AnyValidator[] ?
      VUnion<DeepMutable<Value>, Validators>
    : never
  : never

type TupleToValidatorArray<Value> =
  Value extends (
    | [true, false, ...infer Tail extends readonly EncodedValue[]]
    | [false, true, ...infer Tail extends readonly EncodedValue[]]
  ) ?
    TupleToValidatorArray<Tail> extends infer TailValidators extends AnyValidator[] ?
      [VBoolean, ...TailValidators]
    : never
  : Value extends [infer Head extends EncodedValue, ...infer Tail extends readonly EncodedValue[]] ?
    EncodedSchemaToValidator<Head> extends infer HeadValidator extends AnyValidator ?
      TupleToValidatorArray<Tail> extends infer TailValidators extends AnyValidator[] ?
        [HeadValidator, ...TailValidators]
      : never
    : never
  : []

type DocIdToValidator<Value> =
  Value extends {__tableName: infer TableName extends string} ? VId<GenericId<TableName>> : never

type ArrayToValidator<Value> =
  Value extends ReadonlyArray<infer Element extends EncodedValue> ?
    EncodedSchemaToValidator<Element> extends infer ElementValidator extends AnyValidator ?
      VArray<DeepMutable<Element[]>, ElementValidator>
    : never
  : never

type RecordToValidator<Value> =
  {
    -readonly [Key in keyof Value]-?: PropertyToValidator<Value[Key]>
  } extends infer Fields extends Record<string, any> ?
    {
      -readonly [Key in keyof Value]: DeepMutable<Value[Key]>
    } extends infer RValue extends Record<string, any> ?
      IsRecord<RValue> extends true ?
        VRecord<RValue, VString, Fields[keyof Fields]>
      : VObject<RValue, Fields>
    : never
  : never

type PropertyToValidator<Value> =
  undefined extends Value ?
    [Value] extends [(infer Property extends EncodedValue) | undefined] ?
      EncodedSchemaToValidator<Property> extends infer Vd extends AnyValidator ?
        VOptional<Vd>
      : never
    : never
  : Value extends EncodedValue ? EncodedSchemaToValidator<Value>
  : never

type IsDocId<Value> = Value extends {__tableName: any} ? true : false

type IsRecord<T> =
  T extends Record<string, infer V> ?
    string extends keyof T ?
      keyof T extends string ?
        T extends Record<string, V> ?
          Record<string, V> extends T ?
            true
          : false
        : false
      : false
    : false
  : false

type DeepMutable<T> =
  T extends Brand.Brand<any> | GenericId<any> ? T
  : T extends ReadonlyMap<infer K, infer V> ? Map<DeepMutable<K>, DeepMutable<V>>
  : T extends ReadonlySet<infer V> ? Set<DeepMutable<V>>
  : [keyof T] extends [never] ? T
  : {-readonly [K in keyof T]: DeepMutable<T[K]>}
