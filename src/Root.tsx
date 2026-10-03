import {Composition} from 'remotion';
import {Finqube} from './Finqube';
import {CardTourSource} from './SceneFilm';

export const RemotionRoot = () => (
  <><Composition
    id="FinqubeFull"
    component={Finqube}
    width={720}
    height={1280}
    fps={60}
    durationInFrames={2722}
  /><Composition id="FinqubeCardTourSource" component={CardTourSource} width={720} height={1280} fps={60} durationInFrames={360} /></>
);
