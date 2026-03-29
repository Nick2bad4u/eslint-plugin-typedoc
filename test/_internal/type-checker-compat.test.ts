/**
 * @packageDocumentation
 * Unit tests for TypeChecker optional-API compatibility helpers.
 */
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

import {
    getTypeCheckerApparentType,
    getTypeCheckerBaseConstraintType,
    getTypeCheckerBaseTypes,
    getTypeCheckerIsArrayTypeResult,
    getTypeCheckerIsTupleTypeResult,
    getTypeCheckerIsTypeAssignableToResult,
    getTypeCheckerStringType,
    getTypeCheckerTypeArguments,
} from "../../src/_internal/type-checker-compat";

describe("type-checker-compat", () => {
    const sourceType = {} as ts.Type;
    const sourceTypeReference = {
        flags: ts.TypeFlags.Object,
        objectFlags: ts.ObjectFlags.Reference,
        target: {},
    } as unknown as ts.TypeReference;
    const targetType = {} as ts.Type;

    it("returns undefined from optional helpers when methods are unavailable", () => {
        const checker = {} as ts.TypeChecker;

        expect(getTypeCheckerApparentType(checker, sourceType)).toBeUndefined();
        expect(getTypeCheckerBaseTypes(checker, sourceType)).toBeUndefined();
        expect(
            getTypeCheckerBaseConstraintType(checker, sourceType)
        ).toBeUndefined();
        expect(
            getTypeCheckerIsArrayTypeResult(checker, sourceType)
        ).toBeUndefined();
        expect(
            getTypeCheckerIsTupleTypeResult(checker, sourceType)
        ).toBeUndefined();
        expect(
            getTypeCheckerIsTypeAssignableToResult(
                checker,
                sourceType,
                targetType
            )
        ).toBeUndefined();
        expect(getTypeCheckerStringType(checker)).toBeUndefined();
        expect(
            getTypeCheckerTypeArguments(checker, sourceTypeReference)
        ).toBeUndefined();
    });

    it("does not invoke type-argument lookup for non-reference types", () => {
        const checker = {
            getTypeArguments: vi
                .fn<
                    (
                        this: ts.TypeChecker,
                        type: Readonly<ts.TypeReference>
                    ) => readonly ts.Type[]
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceTypeReference);

                    return [];
                }),
        } as unknown as ts.TypeChecker;

        expect(
            getTypeCheckerTypeArguments(checker, sourceType)
        ).toBeUndefined();
        expect(checker.getTypeArguments).not.toHaveBeenCalled();
    });

    it("delegates apparent type lookup with checker-bound this", () => {
        const expectedType = {} as ts.Type;

        const checker = {
            getApparentType: vi
                .fn<
                    (this: ts.TypeChecker, type: Readonly<ts.Type>) => ts.Type
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceType);

                    return expectedType;
                }),
        } as unknown as ts.TypeChecker;

        expect(getTypeCheckerApparentType(checker, sourceType)).toBe(
            expectedType
        );
    });

    it("delegates base type lookup with checker-bound this", () => {
        const expectedBaseTypes = [{}] as unknown as readonly ts.BaseType[];

        const checker = {
            getBaseTypes: vi
                .fn<
                    (
                        this: ts.TypeChecker,
                        type: Readonly<ts.Type>
                    ) => readonly ts.BaseType[] | undefined
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceType);

                    return expectedBaseTypes;
                }),
        } as unknown as ts.TypeChecker;

        expect(getTypeCheckerBaseTypes(checker, sourceType)).toBe(
            expectedBaseTypes
        );
    });

    it("delegates assignability lookup with checker-bound this", () => {
        const checker = {
            isTypeAssignableTo: vi
                .fn<
                    (
                        this: ts.TypeChecker,
                        source: Readonly<ts.Type>,
                        target: Readonly<ts.Type>
                    ) => boolean
                >()
                .mockImplementation(function (
                    this: ts.TypeChecker,
                    source,
                    target
                ) {
                    expect(this).toBe(checker);
                    expect(source).toBe(sourceType);
                    expect(target).toBe(targetType);

                    return true;
                }),
        } as unknown as ts.TypeChecker;

        expect(
            getTypeCheckerIsTypeAssignableToResult(
                checker,
                sourceType,
                targetType
            )
        ).toBeTruthy();
    });

    it("delegates string type lookup with checker-bound this", () => {
        const expectedStringType = {} as ts.Type;

        const checker = {
            getStringType: vi
                .fn<(this: ts.TypeChecker) => ts.Type>()
                .mockImplementation(function (this: ts.TypeChecker) {
                    expect(this).toBe(checker);

                    return expectedStringType;
                }),
        } as unknown as ts.TypeChecker;

        expect(getTypeCheckerStringType(checker)).toBe(expectedStringType);
    });

    it("delegates base-constraint lookup with checker-bound this", () => {
        const expectedConstraint = {} as ts.Type;

        const checker = {
            getBaseConstraintOfType: vi
                .fn<
                    (
                        this: ts.TypeChecker,
                        type: Readonly<ts.Type>
                    ) => ts.Type | undefined
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceType);

                    return expectedConstraint;
                }),
        } as unknown as ts.TypeChecker;

        expect(getTypeCheckerBaseConstraintType(checker, sourceType)).toBe(
            expectedConstraint
        );
    });

    it("delegates array and tuple lookups with checker-bound this", () => {
        const checker = {
            isArrayType: vi
                .fn<
                    (this: ts.TypeChecker, type: Readonly<ts.Type>) => boolean
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceType);

                    return true;
                }),
            isTupleType: vi
                .fn<
                    (this: ts.TypeChecker, type: Readonly<ts.Type>) => boolean
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceType);

                    return false;
                }),
        } as unknown as ts.TypeChecker;

        expect(
            getTypeCheckerIsArrayTypeResult(checker, sourceType)
        ).toBeTruthy();
        expect(
            getTypeCheckerIsTupleTypeResult(checker, sourceType)
        ).toBeFalsy();
    });

    it("delegates type-argument lookup with checker-bound this", () => {
        const expectedTypeArguments = [{}] as unknown as readonly ts.Type[];

        const checker = {
            getTypeArguments: vi
                .fn<
                    (
                        this: ts.TypeChecker,
                        type: Readonly<ts.TypeReference>
                    ) => readonly ts.Type[]
                >()
                .mockImplementation(function (this: ts.TypeChecker, type) {
                    expect(this).toBe(checker);
                    expect(type).toBe(sourceTypeReference);

                    return expectedTypeArguments;
                }),
        } as unknown as ts.TypeChecker;

        expect(getTypeCheckerTypeArguments(checker, sourceTypeReference)).toBe(
            expectedTypeArguments
        );
    });
});
