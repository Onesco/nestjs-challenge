import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RecordFormat, RecordCategory } from '../src/record/types';
import { getModelToken } from '@nestjs/mongoose';
import { Record } from '../src/record/schemas/record.schema';
import { Model } from 'mongoose';
import { MusicBrainService } from '../src/record/services/musicBrain.service';

describe('RecordController (e2e)', () => {
  let app: INestApplication;
  let recordModel: Model<Record>;
  const createdRecordIds: string[] = [];

  const mockMusicBrainService = {
    fetch: jest.fn().mockResolvedValue({ recordings: ['mocked'] }),
    getTrackList: jest.fn().mockReturnValue(['Track 1', 'Track 2']),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MusicBrainService)
      .useValue(mockMusicBrainService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    recordModel = app.get<Model<Record>>(getModelToken(Record.name));
  });

  afterEach(async () => {
    for (const id of createdRecordIds) {
      await recordModel.findByIdAndDelete(id);
    }
    createdRecordIds.length = 0;
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new record with mocked trackList', async () => {
    const createRecordDto = {
      artist: 'Mock Band',
      album: 'Mock Album',
      price: 25,
      qty: 10,
      mbid: 'mocked-mbid-1234',
      format: RecordFormat.VINYL,
      category: RecordCategory.ROCK,
    };

    const response = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    createdRecordIds.push(response.body._id);

    expect(response.body.artist).toBe('Mock Band');
    expect(response.body.album).toBe('Mock Album');
    expect(response.body.trackList).toEqual(['Track 1', 'Track 2']);
    expect(mockMusicBrainService.fetch).toHaveBeenCalled();
    expect(mockMusicBrainService.getTrackList).toHaveBeenCalled();
  });

  it('should filter by artist after creation', async () => {
    const createRecordDto = {
      artist: 'Filter Band',
      album: 'Filtered Album',
      price: 20,
      qty: 15,
      mbid: 'mocked-mbid-999',
      format: RecordFormat.CD,
      category: RecordCategory.JAZZ,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    createdRecordIds.push(createResponse.body._id);

    const filterResponse = await request(app.getHttpServer())
      .get('/records?artist=Filter Band')
      .expect(200);

    expect(filterResponse.body[0].artist).toBe('Filter Band');
  });
});
