import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "../entities/supabase";
import { withSuspense } from "../lib/withSuspense";
import { Link } from "react-router";

async function getScenes() {
  const { data, error } = await supabase.from("scene").select();
  if (error) {
    throw error;
  }
  return data;
}

function Scenes() {
  const { data } = useSuspenseQuery({
    queryKey: ["scenes"],
    queryFn: getScenes,
  });
  return (
    <>
      <div>a nice list of scenes.</div>
      <ul>
        {data.map((scene: any) => (
          <li key={scene.id}>
            <Link to={`/scene/${scene.id}`}>{scene.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default withSuspense(Scenes, <div>loading...</div>);
