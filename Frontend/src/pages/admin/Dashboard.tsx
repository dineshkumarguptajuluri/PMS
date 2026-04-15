import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { 
  FolderKanban, 
  Users, 
  UserPlus, 
  Clock, 
  ArrowUpRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ManagerStat {
  managerId: number;
  managerEmail: string;
  totalProjects: number;
  averageProgress: number;
  statusCounts: {
    delayed: number;
    onTrack: number;
    atRisk: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [managerStats, setManagerStats] = useState<ManagerStat[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perfRes, pendingRes] = await Promise.all([
          apiClient.get('/admin/performance'),
          apiClient.get('/admin/interests/pending')
        ]);
        setManagerStats(perfRes.data);
        setPendingCount(Array.isArray(pendingRes.data) ? pendingRes.data.length : 0);
      } catch {
        toast.error('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <div className="flex animate-pulse flex-col space-y-4">
      <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-40 bg-gray-100 rounded-xl"></div>
        <div className="h-40 bg-gray-100 rounded-xl"></div>
        <div className="h-40 bg-gray-100 rounded-xl"></div>
      </div>
    </div>;
  }

  const totalProjects = managerStats.reduce((sum, m) => sum + m.totalProjects, 0);

  const stats = [
    { label: 'Total Projects', value: totalProjects, icon: FolderKanban, color: 'text-primary-blue', bg: 'bg-primary-blue/10' },
    { label: 'Active Managers', value: managerStats.length, icon: Users, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Pending Interests', value: pendingCount, icon: UserPlus, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  // Chart data from real manager stats
  const chartData = managerStats.map(m => ({
    name: m.managerEmail.split('@')[0],
    onTrack: m.statusCounts.onTrack,
    delayed: m.statusCounts.delayed,
    progress: m.averageProgress,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-text-muted">Overview of platform performance and operations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden group">
            <CardContent className="p-0 flex items-center space-x-4">
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <div className="absolute top-4 right-4 text-text-muted">
                <ArrowUpRight size={20} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle>Manager Performance</CardTitle>
            <Badge variant="info">By Manager</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      cursor={{fill: '#F3F4F6'}} 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Bar dataKey="onTrack" fill="#A8C66C" radius={[4, 4, 0, 0]} barSize={20} name="On Track" />
                    <Bar dataKey="delayed" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} name="Delayed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-text-muted">
                  No manager data available yet.
                </div>
              )}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-primary-green" />
                <span className="text-xs text-text-secondary">On Track</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-danger" />
                <span className="text-xs text-text-secondary">Delayed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Manager Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {managerStats.map((m) => (
              <div key={m.managerId} className="flex items-start space-x-4">
                <div className="mt-1 p-2 bg-bg-soft rounded-lg text-text-muted">
                  <Clock size={16} />
                </div>
                <div className="flex-1 border-b border-gray-50 pb-4">
                  <p className="text-sm font-medium text-text-primary">{m.managerEmail}</p>
                  <p className="text-xs text-text-muted mt-1">{m.totalProjects} projects · {m.averageProgress}% avg progress</p>
                </div>
              </div>
            ))}
            {managerStats.length === 0 && (
              <div className="py-8 text-center text-text-muted">No managers found.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
