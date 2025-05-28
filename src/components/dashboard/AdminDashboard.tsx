import React from 'react';
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
  Badge,
} from '@chakra-ui/react';
import { 
  Users, 
  Database, 
  FileText, 
  Shield, 
  AlertTriangle 
} from 'lucide-react';

interface StatCardProps {
  title: string;
  stat: string;
  icon: React.ElementType;
  helpText?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, stat, icon, helpText }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  
  return (
    <Stat
      px={4}
      py={5}
      bg={bgColor}
      rounded="lg"
      boxShadow="md"
    >
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText color={textColor}>
              {helpText}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color="blue.500"
          alignContent="center"
        >
          <Icon as={icon} w={8} h={8} />
        </Box>
      </Flex>
    </Stat>
  );
};

const AdminDashboard: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  
  // Mock data for recent activities
  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Uploaded file', resource: 'student_records.csv', timestamp: '2 minutes ago' },
    { id: 2, user: 'Jane Smith', action: 'Added storage config', resource: 'AWS S3 Bucket', timestamp: '1 hour ago' },
    { id: 3, user: 'Mike Johnson', action: 'Created user', resource: 'teacher@example.com', timestamp: '3 hours ago' },
    { id: 4, user: 'Sarah Williams', action: 'Shared file', resource: 'essay_feedback.pdf', timestamp: '5 hours ago' },
    { id: 5, user: 'Robert Brown', action: 'Deleted file', resource: 'old_records.xlsx', timestamp: '1 day ago' },
  ];
  
  // Mock data for security alerts
  const securityAlerts = [
    { id: 1, type: 'Failed login', details: '5 failed attempts for user admin@example.com', severity: 'high', timestamp: '10 minutes ago' },
    { id: 2, type: 'New device login', details: 'New device login from Chicago, IL', severity: 'medium', timestamp: '2 hours ago' },
    { id: 3, type: 'File access attempt', details: 'Unauthorized access attempt to student records', severity: 'high', timestamp: '1 day ago' },
  ];
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Admin Dashboard</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          title="Total Users"
          stat="42"
          icon={Users}
          helpText="12 new this month"
        />
        <StatCard
          title="Storage Configs"
          stat="3"
          icon={Database}
          helpText="AWS, Azure, GCP"
        />
        <StatCard
          title="Encrypted Files"
          stat="156"
          icon={FileText}
          helpText="23 GB total"
        />
        <StatCard
          title="Security Score"
          stat="92%"
          icon={Shield}
          helpText="Up 5% from last week"
        />
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Heading size="md" mb={4}>Recent Activities</Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Action</Th>
                  <Th>Resource</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentActivities.map((activity) => (
                  <Tr key={activity.id}>
                    <Td>{activity.user}</Td>
                    <Td>{activity.action}</Td>
                    <Td>{activity.resource}</Td>
                    <Td>{activity.timestamp}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
        
        <Box bg={bgColor} p={6} rounded="lg" boxShadow="md">
          <Flex align="center" mb={4}>
            <Icon as={AlertTriangle} color="orange.500" mr={2} />
            <Heading size="md">Security Alerts</Heading>
          </Flex>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Details</Th>
                  <Th>Severity</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {securityAlerts.map((alert) => (
                  <Tr key={alert.id}>
                    <Td>{alert.type}</Td>
                    <Td>
                      <Text noOfLines={1}>{alert.details}</Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          alert.severity === 'high'
                            ? 'red'
                            : alert.severity === 'medium'
                            ? 'orange'
                            : 'green'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </Td>
                    <Td>{alert.timestamp}</Td>
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

export default AdminDashboard;