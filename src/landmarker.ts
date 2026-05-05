import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

let landmarkerPromise: Promise<FaceLandmarker> | null = null

export function getLandmarker(): Promise<FaceLandmarker> {
  if (landmarkerPromise) return landmarkerPromise
  landmarkerPromise = (async () => {
    const fileset = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
    )
    return FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 1,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: true,
    })
  })()
  return landmarkerPromise
}

export type FaceLandmark = { x: number; y: number; z: number }
export type FaceResult = {
  landmarks: FaceLandmark[]
  matrix: number[] | null // column-major 4x4
}

export async function detectFace(image: HTMLImageElement): Promise<FaceResult | null> {
  const lm = await getLandmarker()
  const result = lm.detect(image)
  const lms = result.faceLandmarks?.[0]
  if (!lms) return null
  const matrix = result.facialTransformationMatrixes?.[0]?.data
    ? Array.from(result.facialTransformationMatrixes[0].data)
    : null
  return { landmarks: lms, matrix }
}
