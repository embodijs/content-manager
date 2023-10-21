import { PathMapperElementPart } from "./helper";

export class ToLessParamsException extends Error {
    constructor(params: Record<string, string>, parts: PathMapperElementPart[]) {
        super(`To less params: ${Object.keys(params).join(', ')}. Required: ${parts.map(part => part.id).join(', ')}`);
    }
}

export class MatchException extends Error {
    constructor(path: string, regex: string) {
        super(`Path '${path}' does not match regex '${regex}'`);
    }
}