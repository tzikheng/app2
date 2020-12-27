import React from 'react'
import { useField } from 'formik'
import { FormControl, FormErrorMessage, FormLabel, Input} from '@chakra-ui/core'

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  placeholder?: string
  name: string;
}

export const InputField: React.FC<InputFieldProps> = ({label, size:_, ...props}) => { // remove size from props and redefine it
  const [field, {error}] = useField(props);
    return (
      <FormControl isInvalid={!!error}>
        <FormLabel htmlFor={field.name}>{label}</FormLabel>
        <Input 
          {...field} 
          {...props}
          id={field.name} 
          placeholder={props.placeholder} 
        />
        {error ? <FormErrorMessage>{error}</FormErrorMessage>: null}
      </FormControl>
    );
}