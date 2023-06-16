import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CommentDto {
    @IsNotEmpty()
    @IsNumber()
    public task_id: number;

    @IsNotEmpty()
    @IsString()
    public content: string;
}

export class CommentUpdateDto {
    @IsNotEmpty()
    @IsString()
    public content: string;
}