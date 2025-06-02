import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  FormErrorMessage,
  Flex,
  Icon,
  useToast,
  Progress,
  Divider,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { FileText, Upload, Award, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { scoreEssay, initializeModel } from "../../utils/essayScoring";
import { encryptFile } from "../../utils/encryption";

interface EssaySubmissionFormInputs {
  title: string;
  course: string;
  content: string;
}

const EssaySubmission: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [essayScore, setEssayScore] = useState<{
    overall: number;
    coherence: number;
    grammar: number;
    structure: number;
    feedback: string;
  } | null>(null);

  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.700");
  const feedbackBgColor = useColorModeValue("gray.50", "gray.800");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<EssaySubmissionFormInputs>();

  const essayContent = watch("content");

  // Load TensorFlow.js model on component mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        await initializeModel();
        setModelLoading(false);
      } catch (error) {
        console.error("Essay submission failed:", error);
        console.error("Failed to load model:", error);
        toast({
          title: "Model Loading Error",
          description:
            "Failed to load the essay scoring model. Some features may be limited.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadModel();
  }, [toast]);

  const handleScoreEssay = async () => {
    if (!essayContent || essayContent.trim().length < 100) {
      toast({
        title: "Essay too short",
        description:
          "Please write at least 100 characters for accurate scoring.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsScoring(true);

    try {
      const score = await scoreEssay(essayContent);
      setEssayScore(score);
    } catch (error) {
      console.error("Essay submission failed:", error);
      toast({
        title: "Scoring Error",
        description: "Failed to score the essay. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsScoring(false);
    }
  };

  const onSubmit = async (data: EssaySubmissionFormInputs) => {
    setIsSubmitting(true);

    try {
      // Score the essay if not already scored
      let score = essayScore;
      if (!score) {
        score = await scoreEssay(data.content);
        setEssayScore(score);
      }

      // Simulate file encryption and upload
      const file = new File(
        [data.content],
        `${data.title.replace(/\s+/g, "_")}.txt`,
        {
          type: "text/plain",
        }
      );

      const { encryptedData, key } = await encryptFile(file);
      console.log("File encrypted successfully", {
        encryptedData: encryptedData.length,
        keyLength: key.length,
      });

      // Simulate API call to save essay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Essay Submitted",
        description:
          "Your essay has been encrypted and submitted successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form after successful submission
      reset();
      setEssayScore(null);
    } catch (error) {
      console.error("Essay submission failed:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit the essay. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "green.500";
    if (score >= 0.6) return "blue.500";
    if (score >= 0.4) return "orange.500";
    return "red.500";
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Essay Submission
      </Heading>

      {modelLoading && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          Loading essay scoring model... This may take a moment.
        </Alert>
      )}

      <Box bg={bgColor} p={6} rounded="lg" boxShadow="md" maxW="4xl" mx="auto">
        <Flex align="center" mb={4}>
          <Icon as={FileText} color="blue.500" boxSize={6} mr={2} />
          <Heading size="md">Submit New Essay</Heading>
        </Flex>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={4}>
            <FormControl id="title" isInvalid={!!errors.title}>
              <FormLabel>Essay Title</FormLabel>
              <Input
                placeholder="Enter the title of your essay"
                {...register("title", {
                  required: "Title is required",
                })}
              />
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            </FormControl>

            <FormControl id="course" isInvalid={!!errors.course}>
              <FormLabel>Course</FormLabel>
              <Select
                placeholder="Select course"
                {...register("course", {
                  required: "Course is required",
                })}
              >
                <option value="english_101">English Literature 101</option>
                <option value="world_history">World History</option>
                <option value="economics">Economics Fundamentals</option>
              </Select>
              <FormErrorMessage>{errors.course?.message}</FormErrorMessage>
            </FormControl>

            <FormControl id="content" isInvalid={!!errors.content}>
              <FormLabel>Essay Content</FormLabel>
              <Textarea
                placeholder="Write or paste your essay here..."
                minH="300px"
                {...register("content", {
                  required: "Essay content is required",
                  minLength: {
                    value: 100,
                    message: "Essay must be at least 100 characters",
                  },
                })}
              />
              <FormErrorMessage>{errors.content?.message}</FormErrorMessage>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {essayContent
                  ? `${essayContent.length} characters`
                  : "0 characters"}
              </Text>
            </FormControl>

            {essayScore && (
              <>
                <Divider my={4} />

                <Box>
                  <Heading size="sm" mb={3}>
                    Essay Score Analysis
                  </Heading>

                  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
                    <Stat>
                      <StatLabel>Overall</StatLabel>
                      <StatNumber color={getScoreColor(essayScore.overall)}>
                        {Math.round(essayScore.overall * 100)}%
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel>Coherence</StatLabel>
                      <StatNumber color={getScoreColor(essayScore.coherence)}>
                        {Math.round(essayScore.coherence * 100)}%
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel>Grammar</StatLabel>
                      <StatNumber color={getScoreColor(essayScore.grammar)}>
                        {Math.round(essayScore.grammar * 100)}%
                      </StatNumber>
                    </Stat>

                    <Stat>
                      <StatLabel>Structure</StatLabel>
                      <StatNumber color={getScoreColor(essayScore.structure)}>
                        {Math.round(essayScore.structure * 100)}%
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>

                  <Box p={4} bg={feedbackBgColor} rounded="md" mb={4}>
                    <Heading size="xs" mb={2}>
                      Feedback
                    </Heading>
                    <Text>{essayScore.feedback}</Text>
                  </Box>
                </Box>
              </>
            )}

            <Flex justify="space-between" mt={4}>
              <Button
                leftIcon={<Award size={18} />}
                colorScheme="teal"
                variant="outline"
                onClick={handleScoreEssay}
                isLoading={isScoring}
                loadingText="Scoring"
                isDisabled={
                  modelLoading || !essayContent || essayContent.length < 100
                }
              >
                Score Essay
              </Button>

              <Button
                type="submit"
                leftIcon={<Upload size={18} />}
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                Submit Essay
              </Button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default EssaySubmission;
