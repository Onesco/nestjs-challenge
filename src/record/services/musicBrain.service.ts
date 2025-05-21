import { Injectable } from '@nestjs/common';

class RequestError extends Error {
  info: any;
  type: string;
  constructor(message: string, info?: any) {
    super(message);
    this.name = 'RequestError';
    this.type = 'FETCH_ERROR';
    this.info = info;
  }
}

type Recording = {
  disambiguation: string;
  'first-release-date': string;
  video: boolean;
};

type Track = {
  position: number;
  title: string;
  length: number;
  recording: Recording;
  id: string;
};

type MusicBrainRecordResponse = {
  media: {
    'track-count': number;
    position: number;
    tracks: Track[];
  };
};

@Injectable()
export class MusicBrainService {
  async fetch(url: string): Promise<{ data: MusicBrainRecordResponse }> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': 'PostmanRuntime/7.44.0',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new RequestError('error occured while fetching data', {
          status: response.status,
          body: response.body,
        });
      }
      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    }
  }
}
