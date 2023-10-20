import { ToLessParamsException } from "./exceptions";
import { PathMapperElementPart, convertPathMapper } from "./helper";

export class PathMapper {

    private pathExpression: string;
    private parts: PathMapperElementPart[];
    private regex: RegExp;

    constructor(pathExpression: string) {

        const { parts, regex } = convertPathMapper(pathExpression);
        this.parts = parts.filter<PathMapperElementPart>((part): part is PathMapperElementPart => ['element', 'path'].includes(part.type));
        this.regex = regex;
        this.pathExpression = pathExpression;
    }

    match(path: string): Record<string, string> | undefined {
        
        const matches = new RegExp(this.regex).exec(path);

        if(matches == null) {
            return undefined;
        }

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