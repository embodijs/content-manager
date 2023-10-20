import { MatchException } from "./exceptions";
import { PathMapper } from "./pathMapper";
import { describe, test, expect } from "bun:test";

describe("PathMapper", () => {
    describe("constructor", () => {
        test("should create a PathMapper instance with the given path expression", () => {
            const pathExpression = "/users/[path]/posts/[postId].json";
            const pathMapper = new PathMapper(pathExpression);
            expect(pathMapper).toBeInstanceOf(PathMapper);
            expect(pathMapper["pathExpression"]).toBe(pathExpression);
        });
    });

    describe("match", () => {
        test("should return an object with params if the path matches the path expression", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/pages/about-us.page.json";
            const params = pathMapper.match(path);
            expect(params).toEqual({ page: "about-us" });
        });

        test("should return an object with params if the path matches the path expression with multiple segments", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/pages/products/shoes.page.json";
            const params = pathMapper.match(path);
            expect(params).toEqual({ page: "products/shoes"});
        });

        test("should throw an exception if the path does not match the path expression", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/users/123/comments/456";
            expect(() => pathMapper.match(path)).toThrow(MatchException as ErrorConstructor);
        });

        test.each([
            ["/components/header.component.json", "header"],
            ["/components/footer.component.json", "footer"],
            ["/components/hero.component.json", "hero"],
            ["/components/element.test.component.json", "element.test"],
            ["/components/form/radio.component.json", "form/radio"],
            ["/components/checkbox.component.json", "checkbox"],
            ["/components/super-hero.component.json" , "super-hero"],
            ["/components/long/path-to/the_mooin/99/embodiWithJs/and/TypeScript.component.json", "long/path-to/the_mooin/99/embodiWithJs/and/TypeScript"]
        ])("should return the same path when matching: %s", (path, result) => {
            const pathExpression = "/components/[...component].component.json";
            const pathMapper = new PathMapper(pathExpression);
            
            const params = pathMapper.match(path);
            expect(params).toEqual({ component: result });
            
        });

        test("should result to same value on multiple calls", () => {
            const pathExpression = "/components/[...component].component.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/components/long/path-to/the_mooin/99/embodiWithJs/and/TypeScript.component.json";
            const params = pathMapper.match(path);
            const result1 = { component: "long/path-to/the_mooin/99/embodiWithJs/and/TypeScript" };
            expect(params).toEqual(result1);
            const path2 = "/components/long/path-to/the_mooin/99/embodiWithJs/and/TypeScript.component.json";
            const params2 = pathMapper.match(path2);
            expect(params2).toEqual({ component: "long/path-to/the_mooin/99/embodiWithJs/and/TypeScript" });
            const params3 = pathMapper.match(path);
            expect(params3).toEqual(result1);
        })
    });

    describe("test", () => {
        test("should return true if the path matches the path expression", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/pages/about-us.page.json";
            const result = pathMapper.test(path);
            expect(result).toBe(true);
        });

        test("should return true if the path matches the path expression with multiple segments", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/pages/products/shoes.page.json";
            const result = pathMapper.test(path);
            expect(result).toBe(true);
        });

        test("should return false if the path does not match the path expression", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/users/123/comments/456";
            const result = pathMapper.test(path);
            expect(result).toBe(false);
        });

        test("should fail if element is not matching the path", () => {
            const pathExpression = "/embodi/[element].json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/embodi/123/comments/456";
            const result = pathMapper.test(path);
            expect(result).toBe(false);
        })

        test.each([
            ["/components/header.component.json"],
            ["/components/footer.component.json"],
            ["/components/hero.component.json"],
            ["/components/element.test.component.json"],
            ["/components/form/radio.component.json"],
            ["/components/checkbox.component.json"],
            ["/components/super-hero.component.json"],
            ["/components/long/path-to/the_mooin/99/embodiWithJs/and/TypeScript.component.json"],
        ])("should return true when matching: %s", (path) => {
            const pathExpression = "/components/[...component].component.json";
            const pathMapper = new PathMapper(pathExpression);
            const result = pathMapper.test(path);
            expect(result).toBe(true);
        });
    });

    describe("stringify", () => {
        test("should throw an exception if the params object does not have the same number of params as the path expression", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const params = { page: "about-us", lang: "en" };
            expect(() => pathMapper.stringify(params)).toThrow();
        });

        test("should replace the params in the path expression", () => {
            const pathExpression = "/pages/[...path]/[postId].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const params = { path: "blog", postId: "123" };
            const result = pathMapper.stringify(params);
            expect(result).toBe("/pages/blog/123.page.json");
        });

        test("should return a string with the params replaced in the path expression", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const params = { page: "blog/2022/01/01/hello-world" };
            const result = pathMapper.stringify(params);
            expect(result).toBe("/pages/blog/2022/01/01/hello-world.page.json");
        });
    });

    describe("match and stringify", () => {
        test("should return the same path when matching and then stringifying", () => {
            const pathExpression = "/pages/[...page].page.json";
            const pathMapper = new PathMapper(pathExpression);
            const path = "/sub/embodi/main";
            if(pathMapper.test(path)) {
                const params = pathMapper.match(path);
                const result = pathMapper.stringify(params);
                expect(result).toBe(path);
            }
        });

        
        test.each([
            "/components/header.component.json",
            "/components/footer.component.json",
            "/components/hero.component.json",
            "/components/element.test.component.json",
            "/components/radio.component.json", 
            "/components/checkbox.component.json",
            "/components/super-hero.component.json",
        ])("should return the same path when matching and then stringifying: %s", (path: string) => {
            const pathExpression = "/components/[...component].component.json";
            const pathMapper = new PathMapper(pathExpression);
            if(pathMapper.test(path)) {
                const params = pathMapper.match(path);
                const result = pathMapper.stringify(params);
                expect(result).toBe(path);
            }
        });
            
    });
});
