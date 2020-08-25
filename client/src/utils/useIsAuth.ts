import { useEffect } from 'react'
import { useMeQuery } from '../generated/graphql'
import { useRouter } from 'next/router'

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery()
  const router = useRouter()
  console.log(router)
  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace('/login?next=' + router.pathname)
    }
  }, [data, fetching, router])
}
