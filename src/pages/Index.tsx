
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Shield, 
  TrendingUp, 
  Dna, 
  Radio, 
  Lightbulb, 
  ChevronRight,
  DollarSign,
  Users,
  Microscope,
  Lock,
  FileText,
  BarChart3,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FeatureCard } from "@/components/ui/feature-card";
import { HeroSection } from "@/components/ui/hero-section";

const Index = () => {
  const { isAuthenticated, connectWallet } = useAuth();
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMjMyMzIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTItNmg0djFoLTR2LTF6bTAtMmgxdjRoLTF2LTR6bTItMmgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-gray-900 mb-6">
                <span className="text-veltis-purple">Tokenize</span> Your Intellectual Property
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg leading-relaxed">
                VELTIS enables scientists, researchers, and innovators to tokenize and monetize their intellectual property with blockchain security and verification.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={isAuthenticated ? goToDashboard : connectWallet}
                  className="bg-gradient-to-r from-veltis-purple to-veltis-blue hover:from-purple-600 hover:to-blue-600 text-white px-6 py-6 rounded-md text-lg"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Connect Wallet"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                  className="border-veltis-purple text-veltis-purple hover:bg-purple-50 px-6 py-6 rounded-md text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 relative">
              <div className="aspect-video bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="absolute top-0 right-0 h-48 w-48 bg-gradient-to-bl from-veltis-blue/20 to-transparent rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 h-48 w-48 bg-gradient-to-tr from-veltis-purple/20 to-transparent rounded-tr-full"></div>
                
                <div className="relative h-full flex items-center justify-center p-8">
                  <div className="absolute top-4 left-4 text-xs text-gray-400 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                    IP Analytics
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Total Tokenized IP</div>
                      <div className="text-2xl font-bold text-gray-800 flex items-end">
                        2,583
                        <span className="text-green-500 text-xs ml-2">+12.5%</span>
                      </div>
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-veltis-purple to-veltis-blue w-3/4"></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500 mb-1">Market Value</div>
                      <div className="text-2xl font-bold text-gray-800 flex items-end">
                        $120M
                        <span className="text-green-500 text-xs ml-2">+8.3%</span>
                      </div>
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-veltis-teal to-veltis-blue w-2/3"></div>
                      </div>
                    </div>
                    
                    <div className="col-span-2 bg-gradient-to-r from-veltis-purple/10 to-veltis-blue/10 p-4 rounded-xl">
                      <div className="flex justify-between">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Top Performing Sectors</div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="px-2 py-1 bg-white rounded text-xs text-center text-veltis-purple">Biotech</div>
                            <div className="px-2 py-1 bg-white rounded text-xs text-center text-veltis-blue">Pharma</div>
                            <div className="px-2 py-1 bg-white rounded text-xs text-center text-veltis-teal">AI</div>
                          </div>
                        </div>
                        <Dna className="h-10 w-10 text-veltis-purple opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "2.5M+", label: "IP Assets Tokenized" },
              { value: "$120M+", label: "Transaction Volume" },
              { value: "10,000+", label: "Active Users" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-veltis-purple to-veltis-blue">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-veltis-purple to-veltis-blue">Transforming</span> Intellectual Property Management
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform combines blockchain technology with IP best practices to create a new paradigm for managing and monetizing valuable discoveries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Dna className="h-6 w-6 text-veltis-purple" />}
              title="Patent Tokenization"
              description="Transform patents and patent applications into tradable digital assets secured by blockchain technology."
              gradient="from-purple-50 to-indigo-50"
              onClick={() => navigate("/marketplace")}
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-veltis-blue" />}
              title="IP Protection"
              description="Secure your intellectual property with immutable blockchain records that establish clear provenance and ownership."
              gradient="from-blue-50 to-sky-50"
              onClick={() => navigate("/vault")}
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-veltis-teal" />}
              title="Valuation & Analytics"
              description="Leverage market data and AI insights to accurately value your intellectual property assets."
              gradient="from-teal-50 to-blue-50"
              onClick={() => navigate("/analytics")}
            />
            <FeatureCard
              icon={<DollarSign className="h-6 w-6 text-green-600" />}
              title="Marketplace"
              description="Buy, sell, and license intellectual property in a transparent and efficient marketplace."
              gradient="from-green-50 to-emerald-50"
              onClick={() => navigate("/marketplace")}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-amber-600" />}
              title="Fractionalization"
              description="Split ownership of valuable IP assets to enable broader investment and collaboration opportunities."
              gradient="from-amber-50 to-yellow-50"
              onClick={() => navigate("/dashboard")}
            />
            <FeatureCard
              icon={<Lock className="h-6 w-6 text-red-600" />}
              title="Verification System"
              description="Multi-level verification process to establish credibility and trust for tokenized intellectual property."
              gradient="from-red-50 to-rose-50"
              onClick={() => navigate("/vault")}
            />
          </div>
        </div>
      </section>

      {/* How It Works - Simplified Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes it easy to tokenize, verify, and monetize your intellectual property
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  number: "01",
                  title: "Document Upload",
                  description: "Upload your patent documents, research papers, or other IP documentation to our secure platform.",
                  icon: <FileText className="h-12 w-12 text-white" />,
                  color: "from-veltis-purple to-purple-600"
                },
                {
                  number: "02",
                  title: "Blockchain Minting",
                  description: "Your IP is minted as an NFT on the Polygon blockchain, creating an immutable record of ownership.",
                  icon: <Radio className="h-12 w-12 text-white" />,
                  color: "from-veltis-blue to-blue-600"
                },
                {
                  number: "03",
                  title: "Monetization",
                  description: "List your IP-NFT on our marketplace for sale, licensing, or fractionalization to unlock its value.",
                  icon: <Lightbulb className="h-12 w-12 text-white" />,
                  color: "from-veltis-teal to-teal-600"
                }
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className={`flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-r ${step.color} shadow-lg mb-6`}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-sm font-bold text-gray-700">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured IP-NFTs */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured IP-NFTs</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore some of the innovative intellectual property already tokenized on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "CRISPR Gene Editing Method",
                type: "Patent",
                valuation: "$2.3M",
                stage: "Phase I",
                verification: "Expert Reviewed",
                gradient: "from-pink-100 to-rose-200"
              },
              {
                title: "Quantum Computing Algorithm",
                type: "Trade Secret",
                valuation: "$4.8M",
                stage: "Discovery",
                verification: "Institutional",
                gradient: "from-blue-100 to-indigo-200"
              },
              {
                title: "Novel Drug Delivery System",
                type: "Patent Application",
                valuation: "$1.7M",
                stage: "Preclinical",
                verification: "Basic",
                gradient: "from-green-100 to-emerald-200"
              }
            ].map((item, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border-0 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer bg-white"
                onClick={() => navigate("/marketplace")}
              >
                <div className={`h-40 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                  <Dna className="h-16 w-16 text-white opacity-30" />
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      {item.verification}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-medium">{item.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valuation</p>
                      <p className="font-medium">{item.valuation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stage</p>
                      <p className="font-medium">{item.stage}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2 flex items-center justify-center">
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-veltis-purple to-veltis-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Tokenize Your Intellectual Property?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Join the future of IP management and unlock the true value of your innovations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={isAuthenticated ? goToDashboard : connectWallet} 
              className="bg-white text-veltis-purple hover:bg-gray-100 font-medium rounded-md px-8 py-3 text-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Connect Wallet"}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("https://docs.veltis.io", "_blank")}
              className="border-white text-white hover:bg-white/10 font-medium rounded-md px-8 py-3 text-lg"
            >
              Read Documentation <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
