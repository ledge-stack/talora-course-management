'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Spinner } from "@heroui/react";
import { Clock, MapPin, User, Calendar } from "lucide-react";
import api from '@/lib/api';

export default function Timetable() {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await api.get('/timetable');
        setSlots(response.data);
      } catch (err) {
        console.error('Failed to fetch timetable');
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  if (loading) return <Spinner color="primary" />;

  return (
    <div className="space-y-8">
      {days.map((day) => {
        const daySlots = slots.filter(s => s.dayOfWeek === day);
        if (daySlots.length === 0) return null;

        return (
          <div key={day} className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="h-2 w-10 rounded-full bg-indigo-600" />
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{day}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {daySlots.map((slot) => (
                <Card key={slot.id} className="border-none shadow-sm rounded-2xl hover:shadow-md transition-all">
                  <CardBody className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <Chip variant="flat" color="primary" size="sm" className="font-bold">
                        {slot.courseUnit.code}
                      </Chip>
                      <div className="flex items-center gap-1.5 text-indigo-600">
                        <Clock size={14} />
                        <span className="text-xs font-black uppercase tracking-wider">{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-4 line-clamp-1">{slot.courseUnit.title}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{slot.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <User size={14} className="text-slate-400" />
                        <span className="text-xs font-semibold">{slot.lecturerName}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {slots.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
           <Calendar className="text-slate-300 mb-2" size={48} />
           <p className="text-sm font-bold text-slate-400">Timetable has not been published yet.</p>
        </div>
      )}
    </div>
  );
}
