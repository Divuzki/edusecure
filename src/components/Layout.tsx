import React, { ReactNode } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Flex h="100vh" flexDirection="column">
      <Header />
      <Flex flex="1" overflow="hidden">
        <Sidebar />
        <Box
          flex="1"
          p={4}
          bg={useColorModeValue('gray.50', 'gray.800')}
          overflowY="auto"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;