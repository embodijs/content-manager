const MATCH_PATH = /\[\.\.\.([a-zA-Z0-9]+)\]([\.\w\-]*)/;
const MATCH_ELEMENT = /\[([a-zA-Z0-9]+)\]([\.\w\-]*)/;

export type PathMapperElementPart = {
    type: 'element' | 'path';
    id: string;
    regex: string;
}

export type PathMapperStaticPart = {
    type: 'static';
    regex: string;
}

export type PathMapperPart = PathMapperElementPart | PathMapperStaticPart;

export function escapeStringForRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

export function convertToRegex (str: string): PathMapperPart {
    if(MATCH_PATH.test(str)){
        const match = str.match(MATCH_PATH)!;
        const name = match[1];
        const additional = match[2];
        return {
            type: 'path',
            id: name,
            regex: `([\\w\\/\\.\\-]+)${escapeStringForRegExp(additional)}`
        }
    } else if (MATCH_ELEMENT.test(str)) {
        const match = str.match(MATCH_ELEMENT)!;
        const name = match[1];
        const additional = match[2];
        return {
            type: 'element',
            id: name,
            regex: `([\\w\\.\\-]+)${escapeStringForRegExp(additional)}`
        }
    } else {
        return {
            type: 'static',
            regex: escapeStringForRegExp(str)
        }
    }
}

export function convertPathMapper (pathExpresssion: string): {
    regex: RegExp;
    parts: PathMapperPart[];
} {
    
    const pathParts = pathExpresssion.split('/');
    if(pathParts[0] === '') {
        pathParts.shift();
    }
    const pathMapperParts = pathParts.map(convertToRegex);


    const regStr = pathMapperParts.map((part) => part.regex).join('\\/');
    
    
    return {
        regex: new RegExp(`^\\/?${regStr}\\/?$`),
        parts: pathMapperParts
    }
}