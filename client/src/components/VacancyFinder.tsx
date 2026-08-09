'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button, Chip, Divider, Progress, Badge, AvatarGroup, Avatar, Spinner } from "@heroui/react";
import { Search, MapPin, Users, Plus, UserPlus, CheckCircle2 } from "lucide-react";
import api from '@/lib/api';

export default function VacancyFinder() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await api.get('/courses');
      // Fetch groups with vacancies for each course
      const coursesWithGroups = await Promise.all(response.data.map(async (course: any) => {
        const groupsRes = await api.get(`/groups/course/${course.id}`);
        return { ...course, groups: groupsRes.data };
      }));
      setCourses(coursesWithGroups);
    } catch (err) {
      console.error('Failed to fetch vacancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (groupId: string) => {
    try {
      await api.post('/groups/apply', { groupId });
      alert('Application sent to Group Leader!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Application failed');
    }
  };

  if (loading) return <Spinner color="primary" />;

  return (
    <div className="space-y-12">
      {courses.map((course) => {
        const vacantGroups = course.groups?.filter((g: any) => g.memberships.length < course.maxGroupSize);
        if (!vacantGroups || vacantGroups.length === 0) return null;

        return (
          <div key={course.id} className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Search size={18} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{course.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{course.code} • Vacancies Available</p>
               </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vacantGroups.map((group: any) => {
                const vacancyCount = course.maxGroupSize - group.memberships.length;
                return (
                  <Card key={group.id} className="border-none shadow-sm rounded-3xl hover:shadow-xl transition-all duration-300 group">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start mb-6">
                         <Chip variant="flat" color="primary" className="font-bold border-indigo-100">
                           GROUP #{group.groupNumber}
                         </Chip>
                         <Badge content={vacancyCount} color="warning" shape="circle" size="sm">
                            <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                               <Users size={20} />
                            </div>
                         </Badge>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                           <span>Capacity</span>
                           <span>{group.memberships.length}/{course.maxGroupSize} Members</span>
                        </div>
                        <Progress
                          value={(group.memberships.length / course.maxGroupSize) * 100}
                          color={vacancyCount === 1 ? "warning" : "primary"}
                          className="h-2"
                        />
                      </div>

                      <div className="mb-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Team</p>
                        <AvatarGroup isBordered max={4} total={group.memberships.length} size="sm">
                           {group.memberships.map((m: any) => (
                             <Avatar key={m.user.id} src={`https://i.pravatar.cc/150?u=${m.user.studentId}`} />
                           ))}
                        </AvatarGroup>
                      </div>

                      <Button
                        color="primary"
                        className="w-full h-11 font-bold bg-indigo-600 shadow-lg shadow-indigo-100 rounded-2xl group-hover:scale-[1.02]"
                        startContent={<UserPlus size={18} />}
                        onClick={() => handleApply(group.id)}
                      >
                        Request to Join
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {courses.every(c => !c.groups?.some((g: any) => g.memberships.length < c.maxGroupSize)) && (
         <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-center">
            <Users className="text-slate-300 mb-2" size={48} />
            <p className="text-sm font-bold text-slate-400">All groups are currently at full capacity.</p>
         </div>
      )}
    </div>
  );
}
