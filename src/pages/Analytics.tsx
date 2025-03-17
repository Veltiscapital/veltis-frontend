
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, TrendingUp, Clock, PieChart, BarChart3, LineChart } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart as RePieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-medium mb-8">IP Analytics Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((card, index) => (
              <Card key={index} className="glass-card p-5 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                    <h3 className="text-2xl font-medium">{card.value}</h3>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bgColor}`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`text-xs ${card.changeColor} mr-1`}>{card.change}</span>
                  <span className="text-xs text-gray-500">vs previous quarter</span>
                </div>
              </Card>
            ))}
          </div>
          
          <Tabs defaultValue="valuation" className="mb-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
              <TabsTrigger value="comparison">Market Comparison</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="valuation">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card className="glass-card p-5 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">IP Portfolio Valuation Trend</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={valuationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#8884d8" fill="url(#colorValue)" />
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="glass-card p-5 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">IP Value by Category</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              
              <Card className="glass-card p-5 rounded-xl">
                <h3 className="text-lg font-medium mb-4">Value Drivers Analysis</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={driversData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impact" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="comparison">
              <Card className="glass-card p-5 rounded-xl mb-6">
                <h3 className="text-lg font-medium mb-4">Market Comparison</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="yourIP" fill="#0ea5e9" name="Your IP" />
                      <Bar dataKey="marketAverage" fill="#9b87f5" name="Market Average" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card p-5 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">Competitive Landscape</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReLineChart data={competitionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="yourIP" stroke="#0ea5e9" />
                        <Line type="monotone" dataKey="competitor1" stroke="#9b87f5" />
                        <Line type="monotone" dataKey="competitor2" stroke="#2dd4bf" />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="glass-card p-5 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">Citation Impact</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={citationData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0ea5e9" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline">
              <Card className="glass-card p-5 rounded-xl">
                <h3 className="text-lg font-medium mb-4">IP Development & Regulatory Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
                  <div className="space-y-6 ml-10">
                    {timelineEvents.map((event, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-10 top-1 w-6 h-6 rounded-full flex items-center justify-center ${event.passed ? 'bg-green-100 border-2 border-green-500' : 'bg-white border-2 border-veltis-blue'}`}>
                          {event.passed ? 
                            <TrendingUp className="h-3 w-3 text-green-500" /> : 
                            <Clock className="h-3 w-3 text-veltis-blue" />
                          }
                        </div>
                        <div className="pb-2">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className="text-sm text-gray-500">{event.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          {event.impact && (
                            <div className="mt-1 text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded inline-block">
                              Est. Value Impact: {event.impact}
                            </div>
                          )}
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
const kpiCards = [
  {
    title: "Total Portfolio Value",
    value: "$14.2M",
    change: "+8.3%",
    changeColor: "text-green-500",
    icon: <TrendingUp className="h-5 w-5 text-white" />,
    bgColor: "bg-gradient-to-r from-blue-500 to-blue-600"
  },
  {
    title: "Average IP Lifespan",
    value: "17.5 Years",
    change: "+2.1%",
    changeColor: "text-green-500",
    icon: <Clock className="h-5 w-5 text-white" />,
    bgColor: "bg-gradient-to-r from-purple-500 to-purple-600"
  },
  {
    title: "Market Share",
    value: "12.8%",
    change: "+1.5%",
    changeColor: "text-green-500",
    icon: <PieChart className="h-5 w-5 text-white" />,
    bgColor: "bg-gradient-to-r from-teal-500 to-teal-600"
  },
  {
    title: "Citation Index",
    value: "89.3",
    change: "-2.1%",
    changeColor: "text-red-500",
    icon: <BarChart3 className="h-5 w-5 text-white" />,
    bgColor: "bg-gradient-to-r from-indigo-500 to-indigo-600"
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const valuationData = [
  { month: 'Jan', value: 7.2 },
  { month: 'Feb', value: 7.8 },
  { month: 'Mar', value: 9.5 },
  { month: 'Apr', value: 10.2 },
  { month: 'May', value: 11.5 },
  { month: 'Jun', value: 11.8 },
  { month: 'Jul', value: 12.1 },
  { month: 'Aug', value: 13.4 },
  { month: 'Sep', value: 14.2 }
];

const categoryData = [
  { name: 'Patents', value: 8.5 },
  { name: 'Trademarks', value: 2.3 },
  { name: 'Trade Secrets', value: 2.1 },
  { name: 'Copyrights', value: 1.3 }
];

const driversData = [
  { name: 'Market Size', impact: 8.7 },
  { name: 'Innovation Score', impact: 7.9 },
  { name: 'Exclusivity', impact: 9.2 },
  { name: 'Licensing Potential', impact: 6.8 },
  { name: 'Legal Strength', impact: 8.2 }
];

const comparisonData = [
  { name: 'Novelty', yourIP: 8.7, marketAverage: 6.2 },
  { name: 'Citation Impact', yourIP: 7.2, marketAverage: 5.8 },
  { name: 'Claim Breadth', yourIP: 6.8, marketAverage: 5.5 },
  { name: 'Commercial Potential', yourIP: 9.1, marketAverage: 6.5 },
  { name: 'Legal Defensibility', yourIP: 8.5, marketAverage: 6.1 }
];

const competitionData = [
  { year: '2020', yourIP: 4.5, competitor1: 5.2, competitor2: 3.8 },
  { year: '2021', yourIP: 6.2, competitor1: 6.0, competitor2: 4.5 },
  { year: '2022', yourIP: 8.1, competitor1: 6.8, competitor2: 5.3 },
  { year: '2023', yourIP: 9.3, competitor1: 7.5, competitor2: 6.2 }
];

const citationData = [
  { name: 'Your IP', value: 87 },
  { name: 'Competitor A', value: 65 },
  { name: 'Competitor B', value: 52 },
  { name: 'Competitor C', value: 43 },
  { name: 'Competitor D', value: 38 }
];

const timelineEvents = [
  { 
    title: 'Patent Filing', 
    date: 'May 2022', 
    description: 'Initial patent application submitted', 
    passed: true 
  },
  { 
    title: 'Preclinical Testing', 
    date: 'Dec 2022', 
    description: 'Successful completion of preclinical studies', 
    passed: true, 
    impact: '+$1.3M' 
  },
  { 
    title: 'Phase I Trials', 
    date: 'June 2023', 
    description: 'Phase I clinical trials initiated', 
    passed: true, 
    impact: '+$2.8M' 
  },
  { 
    title: 'Phase II Trials', 
    date: 'Q1 2024', 
    description: 'Phase II trials expected to begin', 
    passed: false, 
    impact: 'Est. +$4.2M' 
  },
  { 
    title: 'Regulatory Filing', 
    date: 'Q3 2025', 
    description: 'Submission of regulatory approval application', 
    passed: false, 
    impact: 'Est. +$6.5M' 
  }
];

export default Analytics;
