import React, { useState } from "react";
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
  Flex,
  Icon,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Switch,
  InputGroup,
  InputRightElement,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  Code,
} from "@chakra-ui/react";
import {
  Share2,
  Link,
  Clock,
  Lock,
  Copy,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { generateSecurePassword } from "../../utils/encryption";

interface FileToShare {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface SharedLink {
  id: string;
  fileId: string;
  fileName: string;
  url: string;
  password: string | null;
  expiresAt: Date;
  accessCount: number;
  createdAt: Date;
}

const SecureFileSharing: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileToShare | null>(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [expirationDays, setExpirationDays] = useState(7);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [selectedLink, setSelectedLink] = useState<SharedLink | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.700");
  const selectedRowBg = useColorModeValue("blue.50", "blue.900");
  const hoverRowBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock files data
  const files: FileToShare[] = [
    {
      id: "1",
      name: "Student_Records_2023.xlsx",
      type: "Excel",
      size: "2.4 MB",
      uploadDate: "2023-05-15",
    },
    {
      id: "2",
      name: "Essay_Feedback_John_Smith.pdf",
      type: "PDF",
      size: "1.2 MB",
      uploadDate: "2023-06-02",
    },
    {
      id: "3",
      name: "Course_Materials_Economics101.zip",
      type: "Archive",
      size: "15.7 MB",
      uploadDate: "2023-04-28",
    },
    {
      id: "4",
      name: "Grading_Rubric.docx",
      type: "Word",
      size: "0.5 MB",
      uploadDate: "2023-05-30",
    },
  ];

  const handleSelectFile = (file: FileToShare) => {
    setSelectedFile(file);

    // Generate a random password
    const newPassword = generateSecurePassword(12);
    setPassword(newPassword);
  };

  const handleGenerateLink = () => {
    if (!selectedFile) return;

    setIsGeneratingLink(true);

    // Simulate API call to generate secure link
    setTimeout(() => {
      const newLink: SharedLink = {
        id: `link-${Date.now()}`,
        fileId: selectedFile.id,
        fileName: selectedFile.name,
        url: `https://edu-secure.example.com/share/${
          selectedFile.id
        }?token=${Math.random().toString(36).substring(2, 15)}`,
        password: isPasswordProtected ? password : null,
        expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000),
        accessCount: 0,
        createdAt: new Date(),
      };

      setSharedLinks([newLink, ...sharedLinks]);
      setSelectedLink(newLink);
      setIsGeneratingLink(false);
      onOpen();

      toast({
        title: "Secure link generated",
        description: "The link has been created and is ready to share.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }, 1500);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);

    toast({
      title: "Link copied",
      description: "The secure link has been copied to your clipboard.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCopyPassword = (pwd: string) => {
    navigator.clipboard.writeText(pwd);

    toast({
      title: "Password copied",
      description: "The password has been copied to your clipboard.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteLink = (linkId: string) => {
    setSharedLinks(sharedLinks.filter((link) => link.id !== linkId));

    toast({
      title: "Link deleted",
      description: "The secure link has been deleted.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Secure File Sharing
      </Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Flex align="center" mb={4}>
            <Icon as={Share2} color="blue.500" boxSize={6} mr={2} />
            <Heading size="md">Create Secure Link</Heading>
          </Flex>

          <Text mb={6} color={textColor}>
            Generate secure, encrypted links to share files with students,
            teachers, or administrators. Links can be password-protected and set
            to expire automatically.
          </Text>

          <Stack spacing={4}>
            <FormControl id="file">
              <FormLabel>Select File to Share</FormLabel>
              <Box
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                p={2}
                maxH="200px"
                overflowY="auto"
              >
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th>Size</Th>
                      <Th>Uploaded</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {files.map((file) => (
                      <Tr
                        key={file.id}
                        onClick={() => handleSelectFile(file)}
                        bg={
                          selectedFile?.id === file.id
                            ? selectedRowBg
                            : undefined
                        }
                        cursor="pointer"
                        _hover={{
                          bg: hoverRowBg,
                        }}
                      >
                        <Td>{file.name}</Td>
                        <Td>{file.type}</Td>
                        <Td>{file.size}</Td>
                        <Td>{file.uploadDate}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="password-protection" mb="0">
                Password Protection
              </FormLabel>
              <Switch
                id="password-protection"
                isChecked={isPasswordProtected}
                onChange={() => setIsPasswordProtected(!isPasswordProtected)}
                colorScheme="blue"
              />
            </FormControl>

            {isPasswordProtected && (
              <FormControl id="password">
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputRightElement width="4.5rem">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={
                        showPassword ? <EyeOff size={18} /> : <Eye size={18} />
                      }
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            )}

            <FormControl id="expiration">
              <FormLabel>Link Expiration</FormLabel>
              <Flex align="center">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                  width="100px"
                  mr={2}
                />
                <Text>days</Text>
              </Flex>
            </FormControl>

            <Button
              leftIcon={<Link size={18} />}
              colorScheme="blue"
              onClick={handleGenerateLink}
              isLoading={isGeneratingLink}
              loadingText="Generating"
              isDisabled={!selectedFile}
              mt={2}
            >
              Generate Secure Link
            </Button>
          </Stack>
        </Box>

        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Flex align="center" mb={4}>
            <Icon as={Link} color="blue.500" boxSize={6} mr={2} />
            <Heading size="md">Active Shared Links</Heading>
          </Flex>

          {sharedLinks.length === 0 ? (
            <Text color={textColor}>
              No active shared links. Generate a link to share a file securely.
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>File</Th>
                    <Th>Protected</Th>
                    <Th>Expires</Th>
                    <Th>Access Count</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sharedLinks.map((link) => (
                    <Tr key={link.id}>
                      <Td>
                        <Text noOfLines={1}>{link.fileName}</Text>
                      </Td>
                      <Td>
                        {link.password ? (
                          <Badge colorScheme="green">Yes</Badge>
                        ) : (
                          <Badge colorScheme="red">No</Badge>
                        )}
                      </Td>
                      <Td>{formatDate(link.expiresAt)}</Td>
                      <Td>{link.accessCount}</Td>
                      <Td>
                        <Flex>
                          <IconButton
                            aria-label="Copy link"
                            icon={<Copy size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyLink(link.url)}
                            mr={1}
                          />
                          <IconButton
                            aria-label="Delete link"
                            icon={<Trash2 size={16} />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteLink(link.id)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* Link Created Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Secure Link Created</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedLink && (
              <Stack spacing={4}>
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    File:
                  </Text>
                  <Text>{selectedLink.fileName}</Text>
                </Box>

                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Secure Link:
                  </Text>
                  <Flex>
                    <Code flex="1" p={2} borderRadius="md" noOfLines={1}>
                      {selectedLink.url}
                    </Code>
                    <IconButton
                      aria-label="Copy link"
                      icon={<Copy size={16} />}
                      size="sm"
                      ml={2}
                      onClick={() => handleCopyLink(selectedLink.url)}
                    />
                  </Flex>
                </Box>

                {selectedLink.password && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>
                      Password:
                    </Text>
                    <Flex>
                      <Code flex="1" p={2} borderRadius="md">
                        {selectedLink.password}
                      </Code>
                      <IconButton
                        aria-label="Copy password"
                        icon={<Copy size={16} />}
                        size="sm"
                        ml={2}
                        onClick={() =>
                          handleCopyPassword(selectedLink.password!)
                        }
                      />
                    </Flex>
                  </Box>
                )}

                <Divider />

                <Flex align="center">
                  <Icon as={Clock} color="blue.500" mr={2} />
                  <Text>Expires on {formatDate(selectedLink.expiresAt)}</Text>
                </Flex>

                <Flex align="center">
                  <Icon as={Lock} color="blue.500" mr={2} />
                  <Text>
                    {selectedLink.password
                      ? "Password protected"
                      : "No password protection"}
                  </Text>
                </Flex>
              </Stack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SecureFileSharing;
