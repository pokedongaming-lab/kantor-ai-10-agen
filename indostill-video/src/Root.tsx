import { Composition, staticFile } from "remotion";
import { IndostillAnimatedVideo } from "./IndostillTechVideo";
import subtitlesData from "../public/voiceover_words.json";
import scenesData from "../public/scenes.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="IndostillAnimatedVideo"
      component={IndostillAnimatedVideo}
      durationInFrames={1367} // 45.54 detik * 30 fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        titleHook: "DEEPSEEK-R1 OFFLINE DI KOMPUTER!",
        categoryTag: "⚡ AI REASONING 2026",
        scenes: scenesData,
        audioSrc: staticFile("voiceover.mp3"),
        logoSrc: staticFile("logo-indostill.png"),
        subtitles: subtitlesData,
      }}
    />
  );
};
