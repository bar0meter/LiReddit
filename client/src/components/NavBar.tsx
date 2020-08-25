import { Box, Flex, Link, Button } from '@chakra-ui/core'
import React, { HTMLAttributes } from 'react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { Fragment } from 'react'
import { isServer } from '../utils/isServer'

type NavBarProps = HTMLAttributes<HTMLDivElement>

export const NavBar: React.FC<NavBarProps> = () => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  })
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  let body = null

  if (fetching) { // data is loading
    body = null
  } else if (!data?.me) { // user not logged in
    body = (
      <Fragment>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </Fragment>
    )
  } else { // user logged in
    body = (
      <Flex>
        <Box mr={2}>{data.me?.username}</Box>
        <Button
          onClick={() => logout()}
          variant='link'
          isLoading={logoutFetching}
        >
          Logout
        </Button>
      </Flex>
    )
  }

  return (
    <Flex position='sticky' top={0} zIndex={1} bg='tan' p={4}>
      <Box ml='auto'>
        {body}
      </Box>
    </Flex>
  )
}