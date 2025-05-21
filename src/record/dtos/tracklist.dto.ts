import { MusicBrainRecordResponse } from '../services/musicBrain.service';
import { TrackList } from '../schemas/record.types';

export class TrackListDto {
  tracks: TrackList[] = [];
  constructor(data: MusicBrainRecordResponse) {
    for (const medium of data.media) {
      medium.tracks.map((track) => {
        this.tracks.push({
          title: track.title,
          length: track.length,
          id: track.id,
          firstReleaseDate: track.recording['first-release-date'],
          disambiguation: track.recording.disambiguation,
          titleInTheRecording: track.recording.title,
          video: track.recording.video,
        });
      });
    }
  }
}
