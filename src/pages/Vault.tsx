
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Lock, Users, Shield, Eye, Download, ArrowRight } from "lucide-react";

const Vault = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-medium">Institutional Vault</h1>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Manage Access
              </Button>
              <Button className="bg-gradient-to-r from-veltis-blue to-veltis-purple hover:opacity-90 transition-opacity">
                Upload Documents
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="documents" className="mb-8">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="access">Access Control</TabsTrigger>
              <TabsTrigger value="signatures">Signatures</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>
            
            <TabsContent value="documents" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc, index) => (
                  <Card key={index} className="glass-card overflow-hidden rounded-xl">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-veltis-blue mr-2" />
                          <h3 className="text-lg font-medium">{doc.name}</h3>
                        </div>
                        {doc.encrypted && <Lock className="h-4 w-4 text-veltis-purple" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{doc.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">Added</p>
                          <p>{doc.dateAdded}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p>{doc.category}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Download className="h-3.5 w-3.5 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="access" className="pt-6">
              <Card className="glass-card p-6 rounded-xl mb-6">
                <h2 className="text-xl font-medium mb-4">Access Control Settings</h2>
                <p className="text-gray-600 mb-6">Manage who can access, view, and modify documents in your institutional vault.</p>
                
                <div className="space-y-4">
                  {accessRoles.map((role, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex items-center">
                        <Shield className={`h-8 w-8 p-1.5 rounded-full mr-3 ${roleColors[role.level]}`} />
                        <div>
                          <h3 className="font-medium">{role.name}</h3>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
              
              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-veltis-blue to-veltis-purple hover:opacity-90 transition-opacity">
                  Save Changes
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="signatures" className="pt-6">
              <Card className="glass-card p-6 rounded-xl">
                <h2 className="text-xl font-medium mb-4">Digital Signatures</h2>
                <p className="text-gray-600 mb-6">Track and manage document approvals and digital signatures.</p>
                
                <div className="space-y-4">
                  {signatures.map((sig, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{sig.document}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sig.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          sig.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sig.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{sig.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{sig.signers.join(', ')}</span>
                        </div>
                        <span className="text-gray-500">{sig.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="audit" className="pt-6">
              <Card className="glass-card p-6 rounded-xl">
                <h2 className="text-xl font-medium mb-4">Audit Trail</h2>
                <p className="text-gray-600 mb-6">Complete record of all document interactions and changes.</p>
                
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
                  <div className="space-y-6 ml-10">
                    {auditTrail.map((event, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-10 top-1 w-6 h-6 rounded-full bg-white border-2 border-veltis-blue flex items-center justify-center">
                          {event.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{event.action}</h3>
                          <p className="text-sm text-gray-600">{event.details}</p>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{event.user}</span>
                            <span>{event.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

// Sample data
const documents = [
  {
    name: "Patent Application",
    description: "Complete patent application for novel drug delivery system",
    dateAdded: "2023-09-15",
    category: "Legal",
    encrypted: true
  },
  {
    name: "Clinical Trial Data",
    description: "Raw data from Phase I clinical trials with statistical analysis",
    dateAdded: "2023-08-22",
    category: "Research",
    encrypted: true
  },
  {
    name: "Manufacturing Protocol",
    description: "Detailed manufacturing process and quality control guidelines",
    dateAdded: "2023-07-10",
    category: "Manufacturing",
    encrypted: true
  },
  {
    name: "IP Strategy Memo",
    description: "Internal memo outlining IP protection strategy and timeline",
    dateAdded: "2023-06-05",
    category: "Strategy",
    encrypted: false
  },
  {
    name: "Licensing Agreement",
    description: "Executed licensing agreement with research institution",
    dateAdded: "2023-05-18",
    category: "Legal",
    encrypted: true
  },
  {
    name: "Market Analysis",
    description: "Comprehensive market analysis and competition landscape",
    dateAdded: "2023-04-30",
    category: "Business",
    encrypted: false
  }
];

const accessRoles = [
  {
    name: "Administrator",
    level: "admin",
    description: "Full access to all documents and settings"
  },
  {
    name: "Scientific Team",
    level: "scientific",
    description: "Access to research data and technical documents"
  },
  {
    name: "Legal Team",
    level: "legal",
    description: "Access to patents, contracts, and legal documents"
  },
  {
    name: "Investors",
    level: "investor",
    description: "Limited access to key documents and financials"
  }
];

const roleColors = {
  admin: "bg-purple-100 text-purple-600",
  scientific: "bg-blue-100 text-blue-600",
  legal: "bg-teal-100 text-teal-600",
  investor: "bg-amber-100 text-amber-600"
};

const signatures = [
  {
    document: "Collaboration Agreement",
    description: "Research collaboration agreement with University of Science",
    status: "Completed",
    signers: ["Dr. Jane Smith", "Dr. Mark Johnson"],
    date: "2023-09-20"
  },
  {
    document: "NDA - Project Helix",
    description: "Non-disclosure agreement for Project Helix partners",
    status: "Pending",
    signers: ["Sarah Williams", "Robert Chen", "Ava Martinez"],
    date: "2023-09-18"
  },
  {
    document: "IP Assignment",
    description: "Assignment of intellectual property rights from contractor",
    status: "In Progress",
    signers: ["Michael Brown"],
    date: "2023-09-15"
  }
];

const auditTrail = [
  {
    action: "Document Uploaded",
    details: "Patent Application.pdf was uploaded to the vault",
    user: "Dr. Jane Smith",
    timestamp: "Today, 14:32",
    icon: <FileText className="h-3 w-3 text-veltis-blue" />
  },
  {
    action: "Access Granted",
    details: "Robert Chen was granted access to Legal documents folder",
    user: "Admin User",
    timestamp: "Today, 10:15",
    icon: <Users className="h-3 w-3 text-veltis-blue" />
  },
  {
    action: "Document Signed",
    details: "Collaboration Agreement was signed by all parties",
    user: "Dr. Mark Johnson",
    timestamp: "Yesterday, 16:45",
    icon: <FileText className="h-3 w-3 text-veltis-blue" />
  },
  {
    action: "Security Settings Changed",
    details: "Two-factor authentication was enabled for all users",
    user: "Admin User",
    timestamp: "Sep 18, 2023",
    icon: <Shield className="h-3 w-3 text-veltis-blue" />
  }
];

export default Vault;
