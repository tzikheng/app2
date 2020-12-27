import { Box, Button, Link } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import { useChangePasswordMutation } from '../../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap'
import { createUrqlClient } from '../../utils/createUrqlClient'
import NextLink from 'next/link'

const ChangePassword: NextPage<{token: string}> = ({token}) => {
  const router = useRouter()
  const [,changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')
  return(
    <Wrapper variant='small'>
    <Formik
      initialValues={{ newPassword: ''}} // confirmNewPassword: ''
      onSubmit = {async (values, { setErrors }) => {
        const response = await changePassword({
          newPassword: values.newPassword,
          token
        })
        if (response.data?.changePassword.errors){
          const errorMap = toErrorMap(response.data.changePassword.errors)
          if ('token' in errorMap){
            setTokenError(errorMap.token)
          }
          setErrors(errorMap)
        } else if (response.data?.changePassword.user){
          router.push('/')
        }
      }}
    >
      {({isSubmitting}) => (
        <Form>
          <InputField
            name='newPassword'
            placeholder='New Password'
            label='New Password'
            type='password'
          />
          {tokenError 
            ? (
              <Box>
                <Box style={{color:'red'}}>{tokenError}</Box>
                <NextLink href='/forgot-password'>
                  <Link>Get a new reset link</Link>
                </NextLink>
              </Box>
            ) 
            : null
          }
          <Button 
            mt={4} 
            type='submit' 
            variantColor='teal'
            isLoading={isSubmitting}
          >
            Change password
          </Button>
        </Form>
      )}

    </Formik>
  </Wrapper>
  )
}

ChangePassword.getInitialProps = ({query}) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient)(ChangePassword) // FIXME: Throwing an error here but it compiles ??