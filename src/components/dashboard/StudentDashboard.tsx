import React from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Heading,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Button,
  Badge,
} from "@chakra-ui/react";
import { FileText, BookOpen, Award, Clock } from "lucide-react";

interface StatCardProps {
  title: string;
  stat: string;
  icon: React.ElementType;
  helpText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, stat, icon, helpText }) => {
  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Stat px={4} py={5} bg={bgColor} rounded="lg" boxShadow="md">
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText color={textColor}>{helpText}</StatHelpText>
          )}
        </Box>
        <Box my="auto" color="blue.500" alignContent="center">
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

const StudentDashboard: React.FC = () => {
  const bgColor = useColorModeValue("white", "gray.700");

  // Mock data for essays
  const essays = [
    {
      id: 1,
      title: "The Impact of Climate Change",
      course: "Environmental Science",
      score: 85,
      status: "graded",
    },
    {
      id: 2,
      title: "Analysis of Hamlet",
      course: "English Literature",
      score: 92,
      status: "graded",
    },
    {
      id: 3,
      title: "Modern Economic Theories",
      course: "Economics",
      status: "submitted",
    },
    {
      id: 4,
      title: "The French Revolution",
      course: "World History",
      status: "draft",
    },
  ];

  // Mock data for courses
  const courses = [
    {
      id: 1,
      name: "English Literature 101",
      progress: 85,
      nextDeadline: "Essay on Macbeth (2 days)",
    },
    {
      id: 2,
      name: "World History",
      progress: 72,
      nextDeadline: "Research Paper (1 week)",
    },
    {
      id: 3,
      name: "Economics Fundamentals",
      progress: 68,
      nextDeadline: "Quiz (Tomorrow)",
    },
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Student Dashboard
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="My Essays"
          stat="8"
          icon={FileText}
          helpText="3 graded, 1 submitted, 4 drafts"
        />
        <StatCard
          title="Enrolled Courses"
          stat="3"
          icon={BookOpen}
          helpText="Current semester"
        />
        <StatCard
          title="Average Score"
          stat="88%"
          icon={Award}
          helpText="Up 3% from last month"
        />
        <StatCard
          title="Upcoming Deadlines"
          stat="4"
          icon={Clock}
          helpText="Next: Tomorrow at 11:59 PM"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Heading size="md" mb={4}>
            My Essays
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Title</Th>
                  <Th>Course</Th>
                  <Th>Status</Th>
                  <Th>Score</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {essays.map((essay) => (
                  <Tr key={essay.id}>
                    <Td>
                      <Text noOfLines={1}>{essay.title}</Text>
                    </Td>
                    <Td>{essay.course}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          essay.status === "graded"
                            ? "green"
                            : essay.status === "submitted"
                            ? "blue"
                            : "gray"
                        }
                      >
                        {essay.status}
                      </Badge>
                    </Td>
                    <Td>{essay.score ? `${essay.score}/100` : "-"}</Td>
                    <Td>
                      <Button size="xs" colorScheme="blue">
                        {essay.status === "draft" ? "Edit" : "View"}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Heading size="md" mb={4}>
            My Courses
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Course Name</Th>
                  <Th>Progress</Th>
                  <Th>Next Deadline</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((course) => (
                  <Tr key={course.id}>
                    <Td>{course.name}</Td>
                    <Td>
                      <Box w="100%">
                        <Progress
                          value={course.progress}
                          size="sm"
                          colorScheme="blue"
                          rounded="md"
                        />
                        <Text fontSize="xs" mt={1}>
                          {course.progress}% complete
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      <Text fontSize="sm">{course.nextDeadline}</Text>
                    </Td>
                    <Td>
                      <Button size="xs" colorScheme="blue">
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default StudentDashboard;
