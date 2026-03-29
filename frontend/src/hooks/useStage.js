import { useEffect, useState } from 'react'
import { getStage } from '../api/stageApi'

export function useStage(stageId) {
  const [stageData, setStageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getStage(stageId)
      .then((data) => setStageData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
  }, [stageId])

  return { stageData, loading, error }
}
