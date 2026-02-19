import { useState } from "react";
import UserListScreen from "./UserListScreen";
import AddUserScreen, { type NewUserData } from "./AddUserScreen";
import EditUserScreen, { type UserUpdates } from "./EditUserScreen";
import RoleDetailsScreen from "./RoleDetailsScreen";
import { toast } from "sonner";

interface UserManagementHubProps {
  onBack: () => void;
}

type View = "list" | "add" | "edit" | "roles";

export default function UserManagementHub({ onBack }: UserManagementHubProps) {
  const [view, setView] = useState<View>("list");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // ============================================
  // HANDLERS
  // ============================================

  const handleAddUser = (userData: NewUserData) => {
    // In production: API call to create user
    console.log("Adding user:", userData);
    
    toast.success("User Added", {
      description: `${userData.name} has been added and is pending approval.`,
    });

    setView("list");
  };

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId);
    setView("edit");
  };

  const handleSaveUser = (updates: UserUpdates) => {
    // In production: API call to update user
    console.log("Updating user:", selectedUserId, updates);
    
    toast.success("Changes Saved", {
      description: "User updates are pending approval.",
    });

    setView("list");
    setSelectedUserId(null);
  };

  // ============================================
  // ROUTING
  // ============================================

  switch (view) {
    case "add":
      return (
        <AddUserScreen
          onBack={() => setView("list")}
          onSubmit={handleAddUser}
        />
      );

    case "edit":
      if (!selectedUserId) {
        setView("list");
        return null;
      }
      return (
        <EditUserScreen
          userId={selectedUserId}
          onBack={() => {
            setView("list");
            setSelectedUserId(null);
          }}
          onSave={handleSaveUser}
        />
      );

    case "roles":
      return <RoleDetailsScreen onBack={() => setView("list")} />;

    case "list":
    default:
      return (
        <UserListScreen
          onBack={onBack}
          onAddUser={() => setView("add")}
          onEditUser={handleEditUser}
          onViewRoles={() => setView("roles")}
        />
      );
  }
}
