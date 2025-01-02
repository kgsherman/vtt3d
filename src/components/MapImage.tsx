import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useState } from 'react'

interface MapImageProps {
  imageUrl: string
  ppf: number // pixels per foot
}

export function MapImage({ imageUrl, ppf }: MapImageProps) {
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 })
  const texture = useLoader(THREE.TextureLoader, imageUrl)

  useEffect(() => {
    // Calculate real-world dimensions based on image size and ppf
    const width = texture.image.width / ppf
    const height = texture.image.height / ppf
    setDimensions({ width, height })
  }, [texture, ppf])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[dimensions.width, dimensions.height]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}