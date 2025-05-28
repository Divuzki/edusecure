import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
  Divider,
  Select,
  Link,
} from '@chakra-ui/react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

interface LoginFormInputs {
  email: string;
  password: string;
}

interface RegisterFormInputs extends LoginFormInputs {
  name: string;
  role: string;
}

const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, isLoading, error } = useAuthStore();
  
  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormInputs>();
  
  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      if (isRegistering) {
        await register(data.email, data.password, data.name, data.role);
      } else {
        await login(data.email, data.password);
      }
    } catch (error) {
      // Error is handled by the store
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    reset();
  };
  
  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx="auto" maxW="lg" py={12} px={6}>
        <Stack align="center">
          <Flex align="center" mb={2}>
            <Shield size={32} />
            <Heading ml={2} fontSize="4xl">EduSecure</Heading>
          </Flex>
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
            Secure Educational Data Management
          </Text>
        </Stack>
        
        <Box
          rounded="lg"
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow="lg"
          p={8}
          w="md"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <Heading size="md" textAlign="center">
                {isRegistering ? 'Create an Account' : 'Sign in to your account'}
              </Heading>
              <Divider />
              
              {error && (
                <Text color="red.500" textAlign="center">
                  {error}
                </Text>
              )}
              
              {isRegistering && (
                <FormControl id="name" isInvalid={!!errors.name}>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    {...registerForm('name', {
                      required: 'Name is required',
                    })}
                  />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>
              )}

              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
                  {...registerForm('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...registerForm('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              {isRegistering && (
                <FormControl id="role" isInvalid={!!errors.role}>
                  <FormLabel>Role</FormLabel>
                  <Select
                    {...registerForm('role', {
                      required: 'Role is required',
                    })}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </Select>
                  <FormErrorMessage>{errors.role?.message}</FormErrorMessage>
                </FormControl>
              )}
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
              >
                {isRegistering ? 'Create Account' : 'Sign in'}
              </Button>

              <Flex justify="center">
                <Text mr={2}>
                  {isRegistering ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <Link color="blue.500" onClick={toggleMode}>
                  {isRegistering ? 'Sign in' : 'Register'}
                </Link>
              </Flex>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LoginForm;