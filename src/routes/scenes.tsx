import { createFileRoute, Link } from '@tanstack/react-router'
import { useSceneData, useSceneIds } from '../lib/entities/scene'
import { Suspense } from 'react'

export const Route = createFileRoute('/scenes')({
  component: Index,
})

function SceneLink({ sceneId }: { sceneId: string }) {
  const { name } = useSceneData(sceneId)
  return (
    <Link to="/scenes/$sceneId" params={{ sceneId }}>
      {name}
    </Link>
  )
}
const SceneLinkFallback = () => <p>loading lol</p>

function SceneLinks() {
  const sceneIds = useSceneIds()

  return (
    <ul>
      {sceneIds.map((sceneId) => (
        <li key={sceneId}>
          <Suspense fallback={<SceneLinkFallback />}>
            <SceneLink sceneId={sceneId} />
          </Suspense>
        </li>
      ))}
    </ul>
  )
}
const SceneLinksFallback = () => <p>loading lol</p>

function Index() {
  return (
    <>
      <div className="p-2">
        <h3>These are our scenes</h3>
        <Suspense fallback={<SceneLinksFallback />}>
          <SceneLinks />
        </Suspense>
      </div>
    </>
  )
}
