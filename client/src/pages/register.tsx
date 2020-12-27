import { Box, Button } from '@chakra-ui/core'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useRegisterMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'

// import { REGISTER_MUTATION } from '../graphql'
// @emotion/core error: npm uninstall/yarn remove [@emotion/core, emotion-theming], yarn add @emotion/core @emotion/react@next @emotion/native@next

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter()
  const [,register] = useRegisterMutation()
  return (
      <Wrapper variant='small'>
        <Formik 
          initialValues={{ email:'', username: '', password: ''}}
          onSubmit = {async (values, { setErrors }) => {
            const response = await register({options: values})
            if (response.data?.register.errors){
              setErrors(toErrorMap(response.data.register.errors))
            } else if (response.data?.register.user){
            // response.data.register?.user?.id
              router.push('/')
            }
          }}
        >
          {({values, handleChange, isSubmitting}) => (
            <Form>
              <Box mt={4}>
                <InputField name='username' placeholder='username' label='Username'/>
              </Box>
              <Box mt={4}>
                <InputField name='email' placeholder='email' label='Email'/>
              </Box>
              <Box mt={4}>
                <InputField name='password' placeholder='password' label='Password' type='password'/>
              </Box>
              <Button 
                mt={4} 
                type='submit' 
                variantColor='teal'
                isLoading={isSubmitting}
              >
                Register
              </Button>
            </Form>
          )}

        </Formik>
      </Wrapper>
  )
  
}

export default withUrqlClient(createUrqlClient)(Register)