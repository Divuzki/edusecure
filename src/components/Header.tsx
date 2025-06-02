import React from "react";
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { User, LogOut, Moon, Sun, Shield, Bell } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Header: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuthStore();

  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      py={4}
      px={6}
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Flex align="center">
        <Shield size={24} />
        <Heading size="md" ml={2}>
          EduSecure
        </Heading>
      </Flex>

      <Spacer />

      <Flex align="center">
        <IconButton
          aria-label="Toggle color mode"
          icon={colorMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
          variant="ghost"
          mr={3}
          onClick={toggleColorMode}
        />

        <IconButton
          aria-label="Notifications"
          icon={<Bell size={20} />}
          variant="ghost"
          mr={3}
        />

        {user && (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="User menu"
              icon={<User size={20} />}
              variant="ghost"
            />
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem icon={<LogOut size={16} />} onClick={logout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Flex>
  );
};

export default Header;
