import { Base, ContentPassingRequirement, ContentType } from "../program/programs";

export interface CreateSection{
    programId: number;
    name: string;
    index:number;
}


export interface DahsboardSection extends Base{
    
    contents: DahsboardContent[];
}

export interface DahsboardContent extends Base{
    contentType:ContentType;
    contentPassingRequirement:ContentPassingRequirement;
}