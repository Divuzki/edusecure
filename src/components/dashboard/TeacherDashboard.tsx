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
} from "@chakra-ui/react";
import { FileText, Users, Share2, Clock } from "lucide-react";

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

const TeacherDashboard: React.FC = () => {
  const bgColor = useColorModeValue("white", "gray.700");

  // Mock data for recent essays
  const recentEssays = [
    {
      id: 1,
      student: "Alice Johnson",
      title: "The Impact of Climate Change",
      score: 85,
      submitted: "2 hours ago",
    },
    {
      id: 2,
      student: "Bob Smith",
      title: "Analysis of Hamlet",
      score: 92,
      submitted: "1 day ago",
    },
    {
      id: 3,
      student: "Carol Williams",
      title: "Modern Economic Theories",
      score: 78,
      submitted: "2 days ago",
    },
    {
      id: 4,
      student: "David Brown",
      title: "The French Revolution",
      score: 88,
      submitted: "3 days ago",
    },
  ];

  // Mock data for courses
  const courses = [
    { id: 1, name: "English Literature 101", students: 28, progress: 65 },
    { id: 2, name: "World History", students: 32, progress: 42 },
    { id: 3, name: "Economics Fundamentals", students: 24, progress: 78 },
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Teacher Dashboard
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Essays to Grade"
          stat="12"
          icon={FileText}
          helpText="5 new today"
        />
        <StatCard
          title="Students"
          stat="84"
          icon={Users}
          helpText="Across 3 courses"
        />
        <StatCard
          title="Shared Files"
          stat="36"
          icon={Share2}
          helpText="8 this week"
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
            Recent Essays
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Student</Th>
                  <Th>Essay Title</Th>
                  <Th>Score</Th>
                  <Th>Submitted</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentEssays.map((essay) => (
                  <Tr key={essay.id}>
                    <Td>{essay.student}</Td>
                    <Td>
                      <Text noOfLines={1}>{essay.title}</Text>
                    </Td>
                    <Td>{essay.score}/100</Td>
                    <Td>{essay.submitted}</Td>
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

        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Heading size="md" mb={4}>
            Your Courses
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Course Name</Th>
                  <Th>Students</Th>
                  <Th>Progress</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {courses.map((course) => (
                  <Tr key={course.id}>
                    <Td>{course.name}</Td>
                    <Td>{course.students}</Td>
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
                      <Button size="xs" colorScheme="blue">
                        Manage
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

export default TeacherDashboard;
