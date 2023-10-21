import { MatchException, ToLessParamsException } from "./exceptions";
import { PathMapperElementPart, convertPathMapper, getBasePath } from "./helper";

export class PathMapper {

    private pathExpression: string;
    private parts: PathMapperElementPart[];
    private regex: RegExp;
    private base: string;

    constructor(pathExpression: string) {

        const { parts, regex } = convertPathMapper(pathExpression);
        this.base = getBasePath(parts);
        this.parts = parts.filter<PathMapperElementPart>((part): part is PathMapperElementPart => ['element', 'path'].includes(part.type));
        this.regex = regex;
        this.pathExpression = pathExpression;
    }

    getBasePath(): string {
        return this.base;
    }

    getParams(): string[] {
        return this.parts.reduce((acc, cur) => {
            if(cur.id == null) {
                return acc;
            }
            return [...acc, cur.id];
        }, [] as string[]);
    }

    match(path: string): Record<string, string> {
        
        const matches = new RegExp(this.regex).exec(path);

        if(matches == null) {
            throw new MatchException(path, this.regex.toString());
        }
        matches.shift();
        const matchedValues = this.parts.reduce((acc, part) => {
    
            acc[part.id] = matches.shift()!;
            
            return acc;
        }, {} as Record<string, string>);

        return matchedValues;

    }

    test(path: string): boolean {

        const isMatch = new RegExp(this.regex).test(path);
        return isMatch;
    }

    stringify(params: Record<string, string>): string {
        if(Object.keys(params).length !== this.parts.length) {
            throw new ToLessParamsException(params, this.parts);
        }

        const path = this.parts.reduce((acc, part) => {
            if(part.type === 'element') {
                return acc.replace(`[${part.id}]`, params[part.id]);
            } else if(part.type === 'path') {
                return acc.replace(`[...${part.id}]`, params[part.id]);
            } else {
                return acc;
            }

        }, this.pathExpression);

        return path;

    }
}