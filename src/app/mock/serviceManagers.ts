/**
 * SERVICE MANAGER / RELATIONSHIP MANAGER MOCK DATA
 * Read-only display data for assigned RM panel.
 * No actions, no deep links — display only.
 */

export interface ServiceManager {
  id: string;
  name: string;
  designation: string;
  branch: string;
  unit: string;
  phone: string;
  email: string;
  workingHours: string;
  assignedSince: string;
}

export const ASSIGNED_SERVICE_MANAGER: ServiceManager = {
  id: "rm_001",
  name: "Nusrat Jahan Chowdhury",
  designation: "Relationship Manager",
  branch: "Gulshan Corporate Branch",
  unit: "SME Banking Division",
  phone: "+880-2-8836101 (Ext. 4512)",
  email: "nusrat.chowdhury@bracbank.com",
  workingHours: "Sun–Thu, 09:00 AM – 06:00 PM",
  assignedSince: "2024-09-15",
};

export function getAssignedServiceManager(): ServiceManager {
  return { ...ASSIGNED_SERVICE_MANAGER };
}
