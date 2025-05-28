import React from 'react';
import { 
  Box, 
  Flex, 
  Icon, 
  Link, 
  Stack, 
  Text, 
  useColorModeValue 
} from '@chakra-ui/react';
import { 
  Home, 
  FileText, 
  Users, 
  Database, 
  Lock, 
  Share2, 
  Settings, 
  HelpCircle, 
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Link as RouterLink } from 'react-router-dom';

interface NavItemProps {
  icon: React.ElementType;
  children: string;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to }) => {
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Link
      as={RouterLink}
      to={to}
      style={{ textDecoration: 'none' }}
      _focus={{ boxShadow: 'none' }}
    >
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: hoverBg,
        }}
      >
        <Icon
          mr="4"
          fontSize="16"
          as={icon}
        />
        <Text>{children}</Text>
      </Flex>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  if (!user) {
    return null;
  }
  
  return (
    <Box
      w={{ base: 'full', md: 60 }}
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      pos="relative"
      h="full"
    >
      <Stack spacing={0} py={5}>
        <NavItem icon={Home} to="/dashboard">
          Dashboard
        </NavItem>
        
        {user.role === 'admin' && (
          <>
            <NavItem icon={Users} to="/users">
              User Management
            </NavItem>
            <NavItem icon={Database} to="/storage">
              Storage Config
            </NavItem>
            <NavItem icon={Settings} to="/settings">
              System Settings
            </NavItem>
          </>
        )}
        
        {(user.role === 'teacher' || user.role === 'admin') && (
          <>
            <NavItem icon={FileText} to="/essays">
              Essays & Grading
            </NavItem>
            <NavItem icon={Share2} to="/shared">
              Shared Files
            </NavItem>
          </>
        )}
        
        {user.role === 'student' && (
          <>
            <NavItem icon={FileText} to="/my-essays">
              My Essays
            </NavItem>
            <NavItem icon={BookOpen} to="/courses">
              My Courses
            </NavItem>
          </>
        )}
        
        <NavItem icon={Lock} to="/security">
          Security
        </NavItem>
        <NavItem icon={HelpCircle} to="/help">
          Help & Guide
        </NavItem>
      </Stack>
    </Box>
  );
};

export default Sidebar;