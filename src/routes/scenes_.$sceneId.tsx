import { createFileRoute } from '@tanstack/react-router'
import { useScene } from '../lib/entities/scene'
import { useLevelData } from '../lib/entities/level'
import { Suspense } from 'react'
import HiddenMenu from '../components/scene/hidden-menu'

export const Route = createFileRoute('/scenes_/$sceneId')({
  component: Index,
})

function LevelLink({ levelId }: { levelId: string }) {
  const { name } = useLevelData(levelId)
  return <a href={`/levels/${levelId}`}>{name}</a>
}

const LevelLinkFallback = () => <span>Gimme a sec, loading this guys name</span>

function LevelList({ sceneId }: { sceneId: string }) {
  const { useSceneLevelIds } = useScene(sceneId)
  const levelIds = useSceneLevelIds()

  return (
    <ul>
      {levelIds.map((levelId) => (
        <li key={levelId}>
          <Suspense fallback={<LevelLinkFallback />}>
            <LevelLink levelId={levelId} />
          </Suspense>
        </li>
      ))}
    </ul>
  )
}
const LevelListFallback = () => (
  <ul>
    <li>loading these badboys</li>
  </ul>
)

function Index() {
  const { sceneId } = Route.useParams()
  const { data } = useScene(sceneId)

  return (
    <div className="p-2">
      <h3>Welcome to scene {data.name}.</h3>
      <p>Here are the levels in this scene:</p>
      <Suspense fallback={<LevelListFallback />}>
        <LevelList sceneId={sceneId} />
      </Suspense>
      <hr />
    </div>
  )
}
