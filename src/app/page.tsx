import type { NextPage } from "next";
import dynamic from "next/dynamic";

const VideoComponent = dynamic(
  () => import("@/components/videoComponent").then((mod) => mod.VideoComponent),
  {
    ssr: !!false,
  },
);

const Home: NextPage = () => {
  return <VideoComponent />;
};

export default Home;
