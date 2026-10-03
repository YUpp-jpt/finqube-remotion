import {Composition} from 'remotion';
import {Finqube} from './Finqube';

export const RemotionRoot = () => (
  <Composition
    id="FinqubeFull"
    component={Finqube}
    width={720}
    height={1280}
    fps={60}
    durationInFrames={2722}
  />
);
