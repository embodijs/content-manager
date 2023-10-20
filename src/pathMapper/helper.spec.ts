import { describe, expect, test } from "bun:test";
import { convertPathMapper, convertToRegex, escapeStringForRegExp } from "./helper";
import { memoryUsage } from "bun:jsc";

describe('test escape of strings', () => {
    test('simple string', () => {
        const input = 'hello world';
        const expected = 'hello world';
        const result = escapeStringForRegExp(input);
        expect(result).toBe(expected);
    });

    test('string with special characters', () => {
        const input = 'hello (world)';
        const expected = 'hello \\(world\\)';
        const result = escapeStringForRegExp(input);
        expect(result).toBe(expected);
    });

    test('empty string', () => {
        const input = '';
        const expected = '';
        const result = escapeStringForRegExp(input);
        expect(result).toBe(expected);
    });

    test('string with backslashes', () => {
        const input = 'hello\\world';
        const expected = 'hello\\\\world';
        const result = escapeStringForRegExp(input);
        expect(result).toBe(expected);
    });

    test('string with multiple special characters', () => {
        const input = 'hello (world)\\';
        const expected = 'hello \\(world\\)\\\\';
        const result = escapeStringForRegExp(input);
        expect(result).toBe(expected);
    });
});

describe('test conversion of convert to regex', () => { 

    describe('test static string', () => {
        test('simple string', () => {
            const input = 'partOfPath';
            const expected = {
                type: 'static',
                regex: input
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

        test('string with special characters', () => {
            const input = 'hello_(world)';
            const expected = {
                type: 'static',
                regex: 'hello_\\(world\\)'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });
    });


    describe('convert path string', () => {
        test('onyl path', () => {
            const input = '[...partOfPath]';
            const expected = {
                type: 'path',
                id: 'partOfPath',
                regex: '([\\w\\/\\.\\-]+)'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

        test('path with additional string', () => {
            const input = '[...partOfPath].html';
            const expected = {
                type: 'path',
                id: 'partOfPath',
                regex: '([\\w\\/\\.\\-]+)\\.html'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

        test('path with additional string with special characters', () => {
            const input = '[...partOfPath].com-mm_ent.html';
            const expected = {
                type: 'path',
                id: 'partOfPath',
                regex: '([\\w\\/\\.\\-]+)\\.com-mm_ent\\.html'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

        test('path with numbers and special characters', () => {
            const input = '[...partOfPath].com-mm_.99._--.html';
            const expected = {
                type: 'path',
                id: 'partOfPath',
                regex: '([\\w\\/\\.\\-]+)\\.com-mm_\\.99\\._--\\.html'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

    });



    describe('convert element string', () => {
        test('onyl element', () => {
            const input = '[partOfPath]';
            const expected = {
                type: 'element',
                id: 'partOfPath',
                regex: '([\\w\\.\\-]+)'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

        test('element with additional string', () => {
            const input = '[partOfPath].html';
            const expected = {
                type: 'element',
                id: 'partOfPath',
                regex: '([\\w\\.\\-]+)\\.html'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });

        test('element with additional string with special characters', () => {
            const input = '[partOfPath].com-mm_ent.html';
            const expected = {
                type: 'element',
                id: 'partOfPath',
                regex: '([\\w\\.\\-]+)\\.com-mm_ent\\.html'
            };
            const result = convertToRegex(input);
            expect(result).toStrictEqual(expected);
        });
    });

});

describe('test conversion of path mapper', () => {
    test('simple path', () => {
        const input = 'hello/world';
        const expected = {
            regex: /^\/?hello\/world$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'static',
                    regex: 'world'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect(result.regex.test('/hello/world')).toBe(true);
        expect(result.regex.test('/hello/world/')).toBe(true);
    });

    test('path with element', () => {
        const input = 'hello/[world]';
        const expected = {
            regex: /^\/?hello\/([\\w\\.\\-]+)$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'element',
                    id: 'world',
                    regex: '([\\w\\.\\-]+)'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect(result.regex.test('/hello/world')).toBe(true);
        expect(result.regex.test('/hello/world/')).toBe(true);
    });

    test('path with element and additional string', () => {
        const input = 'hello/[world].html';
        const expected = {
            regex: /^\/?hello\/([\\w\\.\\-]+)\.html$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'element',
                    id: 'world',
                    regex: '([\\w\\.\\-]+)\\.html'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect(result.regex.test('/hello/world.html')).toBe(true);
        

        const matches = result.regex.exec('/hello/world.html');
        expect(matches).not.toBe(null);
        expect(matches?.length).toBe(2);
        expect(matches?.[1]).toBe('world');
    });

    test('long path with special characters', () => {
        const input = '/hello/world/2014-menu/[world].com-m-m_ent.html';
        const expected = {
            regex: /^\/?hello\/([\\w\\.\\-]+)\.com-mm_ent\.html$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'static',
                    regex: 'world'
                },
                {
                    type: 'static',
                    regex: '2014-menu'
                },
                {
                    type: 'element',
                    id: 'world',
                    regex: '([\\w\\.\\-]+)\\.com-m-m_ent\\.html'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect('/hello/world/2014-menu/com-mm_ent.com-m-m_ent.html').toMatch(result.regex);
        expect('/hello/2014-menu/com-mm_ent.com-m-m_ent.html/').not.toMatch(result.regex);
        

        const matches = result.regex.exec('/hello/world/2014-menu/appe.com-m-m_ent.html');
        expect(matches).not.toBe(null);
        expect(matches?.length).toBe(2);
        expect(matches?.[1]).toBe('appe');
    });

    test('long path with path matcher', () => {
        const input = '/hello/world/[...path].page.json';
        const expected = {
            regex: /^\/?hello\/world\/([\w\/\.\-]+)\.page\.json$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'static',
                    regex: 'world'
                },
                {
                    type: 'path',
                    id: 'path',
                    regex: '([\\w\\/\\.\\-]+)\\.page\\.json'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect('/hello/world/2014-menu/com-mm_ent.com-m-m_ent.html').not.toMatch(result.regex);
        expect('/hello/world-2/2014-menu/some.page.json').not.toMatch(result.regex);
        expect('/hello/world/2014-menu/some.page.json').toMatch(result.regex);

        const matches = result.regex.exec('/hello/world/2014-menu/some.page.json');
        expect(matches).not.toBe(null);
        expect(matches?.length).toBe(2);
        expect(matches?.[1]).toBe('2014-menu/some');
        
    });

    test('long path with element and path matcher', () => {
        const input = '/hello/world/[element]/[...element].page.json';
        const expected = {
            regex: /^\/?hello\/world\/([\w\.]+)\/([\w\/\.\-]+)\.page\.json$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'static',
                    regex: 'world'
                },
                {
                    type: 'element',
                    id: 'element',
                    regex: '([\\w\\.\\-]+)'
                },
                {
                    type: 'path',
                    id: 'element',
                    regex: '([\\w\\/\\.\\-]+)\\.page\\.json'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect('/hello/world/2014-menu/com-mm_ent.com-m-m_ent.html').not.toMatch(result.regex);
        expect('/hello/world-2/2014-menu/some.page.json').not.toMatch(result.regex);
        expect('/hello/world/2014-menu/some.page.json').toMatch(result.regex);
        expect('/hello/world/2014-menu/some/other.page.json').toMatch(result.regex);

        const matches = result.regex.exec('/hello/world/2014-menu/additional-test/some.page.json');
        expect(matches).not.toBe(null);
        expect(matches?.length).toBe(3);
        expect(matches?.[1]).toBe('2014-menu');
        expect(matches?.[2]).toBe('additional-test/some');

    });

    test('long path with path matcher and element', () => {
        const input = '/hello/world/[...element]/[element].page.yaml';
        const expected = {
            regex: /^\/?hello\/world\/([\w\/\.\-]+)\/([\w\.]+)\.page\.yaml$/,
            parts: [
                {
                    type: 'static',
                    regex: 'hello'
                },
                {
                    type: 'static',
                    regex: 'world'
                },
                {
                    type: 'path',
                    id: 'element',
                    regex: '([\\w\\/\\.\\-]+)'
                },
                {
                    type: 'element',
                    id: 'element',
                    regex: '([\\w\\.\\-]+)\\.page\\.yaml'
                }
            ]
        };
        const result = convertPathMapper(input);
        expect(result.parts).toStrictEqual(expected.parts);
        expect(result.regex).toBeInstanceOf(RegExp);
        expect('/hello/world/2014-menu/com-mm_ent.com-m-m_ent.html').not.toMatch(result.regex);
        expect('/hello/world-2/2014-menu/some.page.json').not.toMatch(result.regex);
        expect('/hello/world/2014-menu/some.page.json').not.toMatch(result.regex);
        expect('/hello/world/2014-menu/some.page.yaml').toMatch(result.regex);

        const matches = result.regex.exec('/hello/world/2014-menu/additional-test/some.page.yaml');
        expect(matches).not.toBe(null);
        expect(matches?.length).toBe(3);
        expect(matches?.[1]).toBe('2014-menu/additional-test');
        expect(matches?.[2]).toBe('some');
    });

});
