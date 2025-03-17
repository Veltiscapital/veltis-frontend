
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Calendar, ChevronRight, Check, BrainCircuit, LineChart, Award, FileText, Lightbulb, Users } from "lucide-react";
import { toast } from "sonner";

const Consulting = () => {
  const handleConsultingRequest = () => {
    toast.success("Your consultation request has been submitted. We'll contact you shortly.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h1 className="text-5xl font-medium mb-6">
              Expert Biotech <span className="gradient-text">Consulting Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Strategic guidance for biotech innovators from MD-MBA experts with 7+ years of experience in biotech entrepreneurship and tokenization.
            </p>
          </div>
          
          <Tabs defaultValue="services" className="mb-16">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-10">
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="expertise">Expertise</TabsTrigger>
              <TabsTrigger value="case-studies">Case Studies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {services.map((service, index) => (
                  <Card key={index} className="glass-card overflow-hidden rounded-xl hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-veltis-blue to-veltis-purple flex items-center justify-center text-white mb-4">
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-medium mb-2">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <Button variant="outline" className="w-full flex items-center justify-between">
                        Learn More <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              <div className="text-center">
                <Button 
                  className="bg-gradient-to-r from-veltis-blue to-veltis-purple hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  Schedule a Consultation <Calendar className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="expertise">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div>
                  <h2 className="text-2xl font-medium mb-4">Our Expert Team</h2>
                  <p className="text-gray-600 mb-6">
                    Led by MD-MBA professionals with extensive experience in biotechnology innovation, 
                    IP strategy, and venture capital, our team brings a unique perspective to help you 
                    navigate the complex landscape of biotech commercialization and tokenization.
                  </p>
                  
                  <ul className="space-y-3">
                    {expertise.map((item, index) => (
                      <li key={index} className="flex">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Card className="glass-card p-6 rounded-xl">
                  <h3 className="text-xl font-medium mb-4">Technology Readiness Assessment</h3>
                  <p className="text-gray-600 mb-4">
                    Evaluate your biotech innovation's readiness for tokenization and market entry 
                    with our comprehensive assessment framework.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {readinessLevels.map((level, index) => (
                      <div key={index} className="relative pt-1">
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <span className="text-sm font-medium">{level.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium">{level.score}%</span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div 
                            className="bg-gradient-to-r from-veltis-blue to-veltis-purple" 
                            style={{ width: `${level.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-veltis-blue to-veltis-purple hover:opacity-90 transition-opacity"
                  >
                    Get Your Assessment
                  </Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="case-studies">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                {caseStudies.map((study, index) => (
                  <Card key={index} className="glass-card overflow-hidden rounded-xl">
                    <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                      <div className="text-white text-4xl font-bold">{study.logo}</div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-medium mb-2">{study.title}</h3>
                      <p className="text-gray-600 mb-4">{study.description}</p>
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Results:</h4>
                        <ul className="space-y-1">
                          {study.results.map((result, idx) => (
                            <li key={idx} className="flex">
                              <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{result}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button variant="outline" className="w-full">
                        Read Full Case Study
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mb-16">
            <Card className="glass-card p-10 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h2 className="text-2xl font-medium mb-4">Book a Strategy Session</h2>
                  <p className="text-gray-600 mb-6">
                    Schedule a one-on-one consultation with our biotech and tokenization experts 
                    to discuss your specific challenges and opportunities.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" className="w-full border border-gray-300 rounded-md p-2" placeholder="Your email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Company</label>
                      <input type="text" className="w-full border border-gray-300 rounded-md p-2" placeholder="Your company" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Brief Description</label>
                      <textarea className="w-full border border-gray-300 rounded-md p-2" rows={4} placeholder="Tell us about your project or challenges"></textarea>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-veltis-blue to-veltis-purple hover:opacity-90 transition-opacity"
                    onClick={handleConsultingRequest}
                  >
                    Request Consultation
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-medium">Workshop Offerings</h3>
                  
                  <div className="space-y-4">
                    {workshops.map((workshop, index) => (
                      <Card key={index} className="p-4 bg-white border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${workshop.bgColor} text-white flex-shrink-0`}>
                            {workshop.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{workshop.title}</h4>
                            <p className="text-sm text-gray-600">{workshop.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Why Choose Our Consulting?</h4>
                    <ul className="space-y-2">
                      <li className="flex">
                        <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">MD-MBA experts with 7+ years of biotech experience</span>
                      </li>
                      <li className="flex">
                        <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Pioneering tokenization strategies for biotech IP</span>
                      </li>
                      <li className="flex">
                        <Check className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">Network of industry partners and investors</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sample data
const services = [
  {
    title: "Strategic IP Assessment",
    description: "Comprehensive evaluation of your intellectual property portfolio's tokenization potential and market value.",
    icon: <BrainCircuit className="h-6 w-6" />
  },
  {
    title: "Tokenization Strategy",
    description: "Develop a customized roadmap for tokenizing your biotech IP assets for maximum value and security.",
    icon: <LineChart className="h-6 w-6" />
  },
  {
    title: "Regulatory Navigation",
    description: "Expert guidance through complex regulatory frameworks affecting tokenized biotech IP.",
    icon: <FileText className="h-6 w-6" />
  },
  {
    title: "Fundraising Advisory",
    description: "Strategic support for raising capital through traditional and alternative funding mechanisms.",
    icon: <Award className="h-6 w-6" />
  },
  {
    title: "Market Entry Planning",
    description: "Develop go-to-market strategies tailored to your biotech innovation's unique value proposition.",
    icon: <Lightbulb className="h-6 w-6" />
  },
  {
    title: "Ecosystem Development",
    description: "Build partnerships and collaborations to strengthen your position in the biotech and digital asset spaces.",
    icon: <Users className="h-6 w-6" />
  }
];

const expertise = [
  "Patent strategy optimization for biotech innovations",
  "Tokenization frameworks for complex scientific IP",
  "Regulatory strategy for biotechnology assets",
  "Financial modeling and valuation for IP-NFTs",
  "Alternative funding strategies for biotech startups",
  "Market positioning and competitive landscape analysis",
  "Strategic partnerships and ecosystem development",
  "Technology transfer and commercialization planning"
];

const readinessLevels = [
  { name: "Technology Validation", score: 85 },
  { name: "IP Protection", score: 92 },
  { name: "Market Potential", score: 78 },
  { name: "Regulatory Readiness", score: 65 },
  { name: "Tokenization Fit", score: 88 }
];

const caseStudies = [
  {
    logo: "GX",
    title: "GeneXpert Therapeutics",
    description: "An early-stage biotech startup with a novel gene therapy platform seeking to tokenize their IP for alternative funding.",
    results: [
      "Successfully tokenized core IP portfolio",
      "Raised $4.2M through IP-NFT offerings",
      "Accelerated R&D timeline by 18 months",
      "Secured strategic partnership with top pharma company"
    ]
  },
  {
    logo: "NP",
    title: "NeuroPrecision Diagnostics",
    description: "A diagnostic company with innovative neurological testing technology needing a commercialization strategy.",
    results: [
      "Optimized patent portfolio before tokenization",
      "Created tiered NFT structure aligned with clinical milestones",
      "Attracted $2.8M in non-dilutive funding",
      "Expanded market access through digital asset community"
    ]
  }
];

const workshops = [
  {
    title: "IP Tokenization Masterclass",
    description: "1-day intensive workshop on converting biotech IP into digital assets",
    icon: <FileText className="h-5 w-5" />,
    bgColor: "bg-blue-500"
  },
  {
    title: "Alternative Fundraising Strategies",
    description: "Workshop on non-dilutive funding mechanisms for biotech startups",
    icon: <Award className="h-5 w-5" />,
    bgColor: "bg-purple-500"
  },
  {
    title: "Tech Readiness Boot Camp",
    description: "2-day program to prepare your innovation for market and investment",
    icon: <Lightbulb className="h-5 w-5" />,
    bgColor: "bg-teal-500"
  }
];

export default Consulting;
