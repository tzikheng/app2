import React from 'react'
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery, } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{fetching: logoutFetching}, logout] = useLogoutMutation()
  const [{data, fetching}] = useMeQuery({
    pause: isServer(),
  })
  let body = null
  if (fetching) {
    // loading
  } else if (!data?.me) {
    body = (
      <> 
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex>
        <Box mr={2}>
          {data.me.username}
        </Box>
        <Button onClick={() => {
          logout()
        }} isLoading={logoutFetching} variant='link'>Logout</Button>
      </Flex>
    )
  }
    return (
      <Flex bg='tan' p={4}>
        <Box ml={'auto'}>
          {body}
        </Box>
      </Flex>
    );
}