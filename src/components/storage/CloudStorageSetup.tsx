import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Flex,
  Icon,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { Database, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";

interface CloudStorageFormInputs {
  provider: "aws" | "azure" | "gcp";
  name: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  connectionString?: string;
  projectId?: string;
  keyFilename?: string;
}

const CloudStorageSetup: React.FC = () => {
  const [showSecret, setShowSecret] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.700");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<CloudStorageFormInputs>({
    defaultValues: {
      provider: "aws",
    },
  });

  const selectedProvider = watch("provider");

  const onSubmit = async (data: CloudStorageFormInputs) => {
    setIsConnecting(true);
    setTestResult(null);

    // Simulate API call to test connection
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful connection
      setTestResult({
        success: true,
        message: `Successfully connected to ${
          data.name
        } (${data.provider.toUpperCase()})`,
      });

      toast({
        title: "Connection successful",
        description: `Storage configuration for ${data.name} has been saved.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form after successful connection
      reset();
    } catch (error) {
      console.error("Connection test failed:", error);
      setTestResult({
        success: false,
        message:
          "Failed to connect. Please check your credentials and try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Cloud Storage Setup
      </Heading>

      <Box bg={bgColor} p={6} rounded="lg" boxShadow="md" maxW="3xl" mx="auto">
        <Flex align="center" mb={4}>
          <Icon as={Database} color="blue.500" boxSize={6} mr={2} />
          <Heading size="md">Connect Cloud Storage</Heading>
        </Flex>

        <Text mb={6} color={useColorModeValue("gray.600", "gray.400")}>
          Connect your cloud storage provider to securely store and manage
          educational data. All credentials are encrypted and stored securely.
        </Text>

        {testResult && (
          <Alert
            status={testResult.success ? "success" : "error"}
            variant="left-accent"
            mb={6}
            rounded="md"
          >
            <AlertIcon as={testResult.success ? Check : AlertTriangle} />
            <Box flex="1">
              <AlertTitle>
                {testResult.success
                  ? "Connection Successful"
                  : "Connection Failed"}
              </AlertTitle>
              <AlertDescription display="block">
                {testResult.message}
              </AlertDescription>
            </Box>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={() => setTestResult(null)}
            />
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl id="provider" isInvalid={!!errors.provider}>
              <FormLabel>Cloud Provider</FormLabel>
              <Select
                {...register("provider", {
                  required: "Provider is required",
                })}
              >
                <option value="aws">Amazon Web Services (AWS S3)</option>
                <option value="azure">Microsoft Azure (Blob Storage)</option>
                <option value="gcp">
                  Google Cloud Platform (Cloud Storage)
                </option>
              </Select>
              <FormErrorMessage>{errors.provider?.message}</FormErrorMessage>
            </FormControl>

            <FormControl id="name" isInvalid={!!errors.name}>
              <FormLabel>Configuration Name</FormLabel>
              <Input
                placeholder="e.g., Student Records Storage"
                {...register("name", {
                  required: "Name is required",
                })}
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>

            <Divider my={4} />

            {selectedProvider === "aws" && (
              <>
                <FormControl id="region" isInvalid={!!errors.region}>
                  <FormLabel>AWS Region</FormLabel>
                  <Input
                    placeholder="e.g., us-east-1"
                    {...register("region", {
                      required: "Region is required for AWS",
                    })}
                  />
                  <FormErrorMessage>{errors.region?.message}</FormErrorMessage>
                </FormControl>

                <FormControl id="accessKeyId" isInvalid={!!errors.accessKeyId}>
                  <FormLabel>Access Key ID</FormLabel>
                  <Input
                    placeholder="AWS Access Key ID"
                    {...register("accessKeyId", {
                      required: "Access Key ID is required for AWS",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.accessKeyId?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl
                  id="secretAccessKey"
                  isInvalid={!!errors.secretAccessKey}
                >
                  <FormLabel>Secret Access Key</FormLabel>
                  <InputGroup>
                    <Input
                      type={showSecret ? "text" : "password"}
                      placeholder="AWS Secret Access Key"
                      {...register("secretAccessKey", {
                        required: "Secret Access Key is required for AWS",
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showSecret ? "Hide secret" : "Show secret"}
                        icon={
                          showSecret ? <EyeOff size={18} /> : <Eye size={18} />
                        }
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.secretAccessKey?.message}
                  </FormErrorMessage>
                </FormControl>
              </>
            )}

            {selectedProvider === "azure" && (
              <FormControl
                id="connectionString"
                isInvalid={!!errors.connectionString}
              >
                <FormLabel>Connection String</FormLabel>
                <InputGroup>
                  <Input
                    type={showSecret ? "text" : "password"}
                    placeholder="Azure Storage Connection String"
                    {...register("connectionString", {
                      required: "Connection String is required for Azure",
                    })}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showSecret ? "Hide secret" : "Show secret"}
                      icon={
                        showSecret ? <EyeOff size={18} /> : <Eye size={18} />
                      }
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {errors.connectionString?.message}
                </FormErrorMessage>
              </FormControl>
            )}

            {selectedProvider === "gcp" && (
              <>
                <FormControl id="projectId" isInvalid={!!errors.projectId}>
                  <FormLabel>GCP Project ID</FormLabel>
                  <Input
                    placeholder="Google Cloud Project ID"
                    {...register("projectId", {
                      required: "Project ID is required for GCP",
                    })}
                  />
                  <FormErrorMessage>
                    {errors.projectId?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="keyFilename" isInvalid={!!errors.keyFilename}>
                  <FormLabel>Service Account Key (JSON)</FormLabel>
                  <InputGroup>
                    <Input
                      type={showSecret ? "text" : "password"}
                      placeholder="Paste GCP Service Account Key JSON"
                      {...register("keyFilename", {
                        required: "Service Account Key is required for GCP",
                      })}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label={showSecret ? "Hide secret" : "Show secret"}
                        icon={
                          showSecret ? <EyeOff size={18} /> : <Eye size={18} />
                        }
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSecret(!showSecret)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {errors.keyFilename?.message}
                  </FormErrorMessage>
                </FormControl>
              </>
            )}

            <Flex justify="flex-end" mt={4}>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isConnecting}
                loadingText="Connecting"
              >
                Test & Save Connection
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default CloudStorageSetup;
