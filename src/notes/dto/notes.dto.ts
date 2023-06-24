import { IsNotEmpty, IsString } from "class-validator";

export class NoteDto {
    @IsNotEmpty()
    @IsString()
    public content: string;

    @IsNotEmpty()
    @IsString()
    public description: string;
}