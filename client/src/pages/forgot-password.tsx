import { Box, Button } from '@chakra-ui/core'
import React, { useState } from 'react'
import { Wrapper } from '../components/Wrapper'
import { Form, Formik } from 'formik'
import { InputField } from '../components/InputField'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { withUrqlClient } from 'next-urql'

interface forgotPasswordProps {
}

const ForgotPassword: React.FC<forgotPasswordProps> = ({}) => {
  const [complete, setComplete] = useState(false)
  const [, forgotPassword] = useForgotPasswordMutation()

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          setComplete(false)
          await forgotPassword(values)
          setComplete(true)
        }}
      >
        {({ isSubmitting }) => complete ?
          <Box>if account with the email exists, we sent you an email</Box> : (
            <Form>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="text"
              />
              <Box mt={4}>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  variantColor="teal"
                >
                  Change Password
                </Button>
              </Box>
            </Form>
          )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createUrqlClient)(ForgotPassword)