import React, { useEffect, useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import apiClient from '../../api/client';
import { useToast } from '../../hooks/useToast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';

interface ManagerStat {
  managerId: number;
  managerEmail: string;
  totalProjects: number;
  averageProgress: number;
  statusCounts: { delayed: number; onTrack: number; atRisk: number };
}

const AdminPerformance: React.FC = () => {
  const [data, setData] = useState<ManagerStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Correct endpoint: GET /api/admin/performance
        const response = await apiClient.get('/admin/performance');
        setData(response.data);
      } catch {
        toast.error('Failed to load performance analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div className="h-96 w-full animate-pulse bg-bg-soft rounded-xl"></div>;

  const totalProjects = data.reduce((s, m) => s + m.totalProjects, 0);
  const avgProgress = data.length > 0 
    ? Math.round(data.reduce((s, m) => s + m.averageProgress, 0) / data.length) 
    : 0;
  const totalDelayed = data.reduce((s, m) => s + m.statusCounts.delayed, 0);

  const chartData = data.map(m => ({
    name: m.managerEmail.split('@')[0],
    progress: m.averageProgress,
    projects: m.totalProjects,
    onTrack: m.statusCounts.onTrack,
    delayed: m.statusCounts.delayed,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics & Performance</h1>
        <p className="text-text-muted">Manager productivity and project health analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-blue text-white">
          <CardContent className="pt-6">
            <Award className="mb-2 opacity-50" size={24} />
            <p className="text-sm opacity-80">Total Projects</p>
            <p className="text-3xl font-bold">{totalProjects}</p>
            <div className="mt-4 flex items-center text-xs bg-white/10 w-fit px-2 py-1 rounded">
              <TrendingUp size={12} className="mr-1" />
              Across {data.length} managers
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary-green/20">
          <CardContent className="pt-6">
            <Target className="mb-2 text-primary-green" size={24} />
            <p className="text-sm text-text-muted">Average Progress</p>
            <p className="text-3xl font-bold text-text-primary">{avgProgress}%</p>
            <div className="mt-4 w-full bg-bg-soft rounded-full h-2">
              <div className="bg-primary-green h-full rounded-full" style={{width: `${avgProgress}%`}}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <TrendingUp className="mb-2 text-warning" size={24} />
            <p className="text-sm text-text-muted">Delayed Projects</p>
            <p className="text-3xl font-bold text-text-primary">{totalDelayed}</p>
            {totalDelayed > 0 && <p className="text-xs text-danger mt-2">Requires attention</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 text-primary-blue" size={18} />
            Manager Progress Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="progress" fill="#5FA8D3" radius={[4, 4, 0, 0]} barSize={30} name="Avg Progress %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted">
              No manager data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPerformance;
