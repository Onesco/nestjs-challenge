import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecordCategory, RecordFormat } from '../types';

export class RecordFilterDto {
  @ApiPropertyOptional({
    description:
      'Search query (search across multiple fields like artist, album, category, etc.)',
  })
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by artist name' })
  artist?: string;

  @ApiPropertyOptional({ description: 'Filter by album name' })
  album?: string;

  @ApiPropertyOptional({
    description: 'Filter by record format (Vinyl, CD, etc.)',
    enum: RecordFormat,
  })
  format?: RecordFormat;

  @ApiPropertyOptional({
    description: 'Filter by record category (e.g., Rock, Jazz)',
    enum: RecordCategory,
  })
  category?: RecordCategory;

  @ApiPropertyOptional({
    description: 'Page number for pagination (starts from 1)',
    default: 1,
    minimum: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  limit?: number;
}
