import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

export const ForgotPassword: React.FC<{}>= ({}) => {
  const [complete, setComplete] = useState(false)
  const [, forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant='small'>
      <Formik 
        initialValues={{ email: ''}}
        onSubmit = {async (values) => {
          await forgotPassword(values)
          setComplete(true)
          
        }}
      >
        {({isSubmitting}) => complete 
        ? (<Box>A message has been sent to that email</Box>)
        : (
          <Form>
            <InputField
              name='email'
              placeholder='Email'
              label='Email'
              type='email'
            />
            <Button 
              mt={4} 
              type='submit' 
              variantColor='teal'
              isLoading={isSubmitting}
            >
              Reset password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient) (ForgotPassword)