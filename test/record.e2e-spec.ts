import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Record } from '../src/record/schemas/record.schema';
import { Model } from 'mongoose';
import { RecordFormat, RecordCategory } from '../src/record/types';
import { MusicBrainService } from '../src/record/services/musicBrain.service';

describe('RecordController (e2e) with partial MusicBrainService mock', () => {
  let app: INestApplication;
  let recordModel: Model<Record>;
  const createdRecordIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const realMusicBrainService =
      moduleFixture.get<MusicBrainService>(MusicBrainService);

    jest.spyOn(realMusicBrainService, 'fetch').mockResolvedValue({
      media: [
        {
          tracks: [
            {
              title: 'Mocked Track 1',
              position: 0,
              recording: {
                disambiguation: 'fake',
                'first-release-date': 'some date',
                video: true,
                title: 'some title',
              },
              length: 3244,
              id: 'some id',
            },
            {
              title: 'Mocked Track 2',
              position: 1,
              recording: {
                disambiguation: 'fake',
                'first-release-date': 'some date',
                video: true,
                title: 'some title',
              },
              length: 3244,
              id: 'some id',
            },
          ],
        },
      ],
    });

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

  it('should create a record with real getTrackList and mocked fetch', async () => {
    const createRecordDto = {
      artist: 'Partial Mock Band',
      album: 'Partial Mock Album',
      price: 40,
      qty: 5,
      mbid: 'mocked-partial-123',
      format: RecordFormat.VINYL,
      category: RecordCategory.CLASSICAL,
    };

    const response = await request(app.getHttpServer())
      .post('/records')
      .send(createRecordDto)
      .expect(201);

    createdRecordIds.push(response.body._id);

    expect(response.body.trackList).toEqual([
      {
        disambiguation: 'fake',
        firstReleaseDate: 'some date',
        id: 'some id',
        length: 3244,
        title: 'Mocked Track 1',
        titleInTheRecording: 'some title',
        video: true,
      },
      {
        disambiguation: 'fake',
        firstReleaseDate: 'some date',
        id: 'some id',
        length: 3244,
        title: 'Mocked Track 2',
        titleInTheRecording: 'some title',
        video: true,
      },
    ]);
    expect(response.body.artist).toBe('Partial Mock Band');
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
