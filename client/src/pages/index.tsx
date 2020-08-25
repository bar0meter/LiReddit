import React from 'react'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import { createUrqlClient } from '../utils/createUrqlClient'
import { usePostsQuery } from '../generated/graphql'
import Layout from '../components/Layout'
import { Box, Heading, Link, Stack, Text, Flex } from '@chakra-ui/core'
import { Button } from '@chakra-ui/core/dist'

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  })

  if (!fetching && !data) {
    return <div>you got no posts for some reason</div>
  }

  return (
    <Layout>
      <Flex justifyContent="center" alignItems="center" mb={2}>
        <Heading>LiReddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">
            <b>CREATE POST</b>
          </Link>
        </NextLink>
      </Flex>
      {fetching && !data ? (
        <div>loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.map((p, _) => (
            <Box key={p.id} p={5} shadow="md" borderWidth="1px">
              <Heading fontSize="xl">{p.title}</Heading>
              <Text mt={4}>{p.textSnippet + '...'}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {data ? (
        <Flex>
          <Button m="auto" my={8} variantColor="teal" isLoading={fetching}>
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  )
}
export default withUrqlClient(createUrqlClient, { ssr: true })(Index)
