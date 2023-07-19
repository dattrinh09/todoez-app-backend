import { Controller, Post, Get, Put, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NoteDto } from './dto/notes.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Post('/:team_id')
  async createNote(
    @Req() req,
    @Param() params: { team_id: string },
    @Body() dto: NoteDto
  ) {
    return await this.notesService.createNote(
      req,
      parseInt(params.team_id),
      dto
    );
  }

  @Get('/:team_id')
  async getNotes(
    @Req() req,
    @Param() params: { team_id: string },
    @Query('keyword') keyword: string,
    @Query('user') user: string,
    @Query('page') page: string,
    @Query('limit') limit: string
  ) {
    return await this.notesService.getNotes(
      req,
      parseInt(params.team_id),
      keyword,
      parseInt(user),
      parseInt(page),
      parseInt(limit)
    );
  }

  @Put('/:team_id/:id')
  async updateNote(
    @Req() req,
    @Param() params: { team_id: string, id: string },
    @Body() dto: NoteDto
  ) {
    return await this.notesService.updateNote(
      req,
      parseInt(params.team_id),
      parseInt(params.id),
      dto
    );
  }

  @Delete('/:team_id/:id')
  async deleteNote(
    @Req() req,
    @Param() params: { team_id: string, id: string },
  ) {
    return await this.notesService.deleteNote(
      req,
      parseInt(params.team_id),
      parseInt(params.id)
    );
  }
}
