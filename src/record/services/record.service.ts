import { Injectable } from '@nestjs/common';
import { Record } from '../schemas/record.schema';
import { FilterQuery } from 'mongoose';
import { RecordRepository } from '../record.repository';
import { UpdateRecordRequestDTO } from '../dtos/update-record.request.dto';
import { CreateRecordRequestDTO } from '../dtos/create-record.request.dto';
import { MusicBrainService } from './musicBrain.service';
import { TrackListDto } from '../dtos/tracklist.dto';

const musicBrainBaseUrl = process.env.MUSIC_BRAIN_BASEURL;

export type RecordFilterOptions = {
  limit?: number;
  offset?: number;
} & FilterQuery<Record>;

@Injectable()
export class RecordService {
  constructor(
    private readonly recordRepository: RecordRepository,
    private readonly musicBrain: MusicBrainService,
  ) {}
  findAll(filterOptions: RecordFilterOptions) {
    const { album, q, format, category, artist } = filterOptions;

    const query: FilterQuery<Record> = {};

    if (q) {
      query.$or = [
        { artist: { $regex: q, $options: 'i' } },
        { album: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { format: { $regex: q, $options: 'i' } },
      ];
    }

    if (artist) {
      query.artist = { $regex: artist, $options: 'i' };
    }

    if (album) {
      query.album = { $regex: album, $options: 'i' };
    }

    if (format) {
      query.format = format;
    }

    if (category) {
      query.category = category;
    }
    return this.recordRepository.find(query);
  }
  async findByIdAndUpdate(id: string, updateRecordDto: UpdateRecordRequestDTO) {
    if (updateRecordDto.mbid) {
      const url = `${musicBrainBaseUrl}${updateRecordDto.mbid}?inc=recordings`;
      const [record, releaseRords] = await Promise.all([
        this.recordRepository.findOne({ _id: id }),
        this.musicBrain.fetch(url),
      ]);
      if (record.mbid !== updateRecordDto.mbid) {
        const trackList = new TrackListDto(releaseRords).tracks;

        return this.recordRepository.findOneAndUpdate(
          { _id: id },
          { $set: { ...updateRecordDto, trackList: trackList } },
        );
      }
    }
    return this.recordRepository.findOneAndUpdate(
      { _id: id },
      { $set: updateRecordDto },
    );
  }
  async create(request: CreateRecordRequestDTO) {
    const url = `${musicBrainBaseUrl}${request.mbid}?inc=recordings`;
    const releaseRords = await this.musicBrain.fetch(url);
    const trackList = new TrackListDto(releaseRords).tracks;
    return this.recordRepository.create({
      ...request,
      created: new Date(),
      trackList,
    });
  }
}
