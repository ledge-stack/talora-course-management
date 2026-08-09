'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Chip,
  Card,
  CardHeader,
  CardBody,
  Input,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Tabs,
  Tab,
  User,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem
} from "@heroui/react";
import {
  Download,
  Search,
  Settings,
  Plus,
  Calendar,
  Users,
  ShieldCheck,
  MoreVertical,
  ArrowLeftRight,
  Clock,
  LayoutGrid,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileSpreadsheet
} from "lucide-react";
import { motion } from "framer-motion";
import api from '@/lib/api';
import MainNavbar from '@/components/MainNavbar';
import AddCourseModal from '@/components/AddCourseModal';
import SetDeadlineModal from '@/components/SetDeadlineModal';
import MoveStudentModal from '@/components/MoveStudentModal';

export default function AdminPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");
  const router = useRouter();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const [mergeData, setMergeOpenData] = useState({ sourceGroupId: "", targetGroupId: "" });
  const [selectedCourseGroups, setSelectedCourseGroups] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, complaintsRes, timetableRes] = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/complaints'),
        api.get('/timetable')
      ]);
      setCourses(coursesRes.data);
      setComplaints(complaintsRes.data);
      setTimetable(timetableRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'class_rep') router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleMasterExport = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    window.open(`${apiUrl}/admin/export-master?token=${token}`, '_blank');
  };

  const updateComplaintStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/complaints/${id}`, { status });
      fetchData();
    } catch (err) {
      alert('Update failed');
    }
  };

  const openDeadlineModal = (course: any) => {
    setSelectedCourse(course);
    setIsDeadlineOpen(true);
  };

  const openMoveModal = (course: any) => {
    setSelectedCourse(course);
    setIsMoveOpen(true);
  };

  const openMergeModal = async (course: any) => {
    setSelectedCourse(course);
    try {
      const response = await api.get(`/groups/course/${course.id}`);
      setSelectedCourseGroups(response.data);
      setIsMergeOpen(true);
    } catch (err) {
      alert('Failed to load groups');
    }
  };

  const handleMerge = async () => {
    if (!mergeData.sourceGroupId || !mergeData.targetGroupId) return;
    try {
      await api.post('/groups/merge', mergeData);
      setIsMergeOpen(false);
      fetchData();
      alert('Groups merged successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Merge failed');
    }
  };

  const filteredItems = courses.filter((course) =>
    course.code.toLowerCase().includes(filterValue.toLowerCase()) ||
    course.title.toLowerCase().includes(filterValue.toLowerCase())
  );

  const stats = [
    { label: "Active Units", value: courses.length, icon: <LayoutGrid className="text-indigo-600" />, color: "bg-indigo-50" },
    { label: "Open Issues", value: complaints.filter(c => c.status === 'open').length, icon: <AlertCircle className="text-rose-600" />, color: "bg-rose-50" },
    { label: "Pending Tasks", value: courses.filter(c => !c.submissionDeadline).length, icon: <ClipboardList className="text-orange-600" />, color: "bg-orange-50" },
  ];

  if (loading) return <Spinner color="primary" className="flex h-screen w-full justify-center" />;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <MainNavbar />

      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1320px] mx-auto px-4 py-8 lg:px-8"
      >
        <div className="page-surface mb-10 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase tracking-[0.05em]">Master Admin Panel</h1>
                <p className="text-slate-500 text-sm font-medium">Class Representative Oversight & Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                color="secondary"
                variant="flat"
                className="font-bold rounded-xl h-11"
                startContent={<FileSpreadsheet size={18} />}
                onClick={handleMasterExport}
              >
                Export Master CSV
              </Button>
              <Button
                color="primary"
                className="bg-indigo-600 font-bold shadow-lg shadow-indigo-100 h-11 px-6 rounded-xl"
                startContent={<Plus size={18} />}
                onPress={() => setIsAddOpen(true)}
              >
                New Course
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none shadow-sm p-2 overflow-visible rounded-3xl bg-white/80 backdrop-blur">
                <CardBody className="flex flex-row items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl ${stat.color} flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs
          variant="underlined"
          color="primary"
          classNames={{
            tabList: "gap-8 border-b border-divider",
            cursor: "bg-indigo-600 h-0.5",
            tabContent: "font-black uppercase tracking-widest text-[11px] group-data-[selected=true]:text-indigo-600"
          }}
        >
          <Tab key="courses" title="Course Management">
            <div className="pt-8">
               <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                <CardHeader className="p-6 sm:p-8 bg-white border-b border-slate-50">
                   <Input
                    isClearable
                    className="w-full sm:max-w-[400px]"
                    placeholder="Filter courses..."
                    startContent={<Search size={18} className="text-slate-400" />}
                    value={filterValue}
                    onValueChange={setFilterValue}
                    variant="bordered"
                    classNames={{ inputWrapper: "rounded-2xl border-slate-200" }}
                  />
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-x-auto">
                    <Table aria-label="Course Table" removeWrapper classNames={{ th: "bg-slate-50/50 text-slate-500 font-bold text-[10px] uppercase tracking-widest py-6 px-8", td: "py-6 px-8 border-b border-slate-50" }}>
                      <TableHeader>
                        <TableColumn>UNIT CODE & TITLE</TableColumn>
                        <TableColumn>CAPACITY</TableColumn>
                        <TableColumn>DEADLINE</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn align="end">MANAGEMENT</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">{course.code}</span>
                                <span className="text-xs text-slate-500 font-medium">{course.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Chip size="sm" variant="flat" className="font-bold bg-slate-100 text-slate-600">
                                {course.minGroupSize}-{course.maxGroupSize} Members
                              </Chip>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                 <Clock size={14} className="text-indigo-500" />
                                 {course.submissionDeadline ? new Date(course.submissionDeadline).toLocaleDateString() : 'Unset'}
                               </div>
                            </TableCell>
                            <TableCell>
                               <Chip size="sm" variant="dot" color={course.allowsSwaps ? "success" : "warning"} className="font-black text-[9px] uppercase">
                                 {course.allowsSwaps ? 'Swaps Open' : 'Swaps Locked'}
                               </Chip>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button isIconOnly variant="light" size="sm" radius="full" onClick={() => openDeadlineModal(course)}>
                                  <Clock size={18} />
                                </Button>
                                <Dropdown>
                                  <DropdownTrigger>
                                    <Button isIconOnly variant="light" size="sm" radius="full">
                                      <MoreVertical size={18} />
                                    </Button>
                                  </DropdownTrigger>
                                  <DropdownMenu variant="flat">
                                    <DropdownItem key="move" startContent={<ArrowLeftRight size={16} />} onPress={() => setIsMoveOpen(true)}>Move Student</DropdownItem>
                                    <DropdownItem key="merge" startContent={<Users size={16} />} onPress={() => openMergeModal(course)}>Merge Groups</DropdownItem>
                                    <DropdownItem key="delete" color="danger" className="text-danger" startContent={<Trash2 size={16} />}>Archive Unit</DropdownItem>
                                  </DropdownMenu>
                                </Dropdown>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardBody>
               </Card>
            </div>
          </Tab>

          <Tab key="complaints" title="Complaints Portal">
            <div className="pt-8 grid gap-4">
              {complaints.map((c) => (
                <Card key={c.id} className="border-none shadow-sm rounded-3xl overflow-hidden">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                         <User
                           name={c.user.fullName}
                           description={c.user.studentId}
                           avatarProps={{ size: "md", src: `https://i.pravatar.cc/150?u=${c.user.studentId}` }}
                         />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Chip size="sm" color={c.status === 'open' ? 'danger' : c.status === 'in_review' ? 'warning' : 'success'} variant="flat" className="font-black text-[9px] uppercase">
                          {c.status.replace('_', ' ')}
                        </Chip>
                        <Select
                          size="sm"
                          placeholder="Action"
                          className="w-32"
                          variant="bordered"
                          onSelectionChange={(keys) => updateComplaintStatus(c.id, Array.from(keys)[0] as string)}
                        >
                           <SelectItem key="open">Mark Open</SelectItem>
                           <SelectItem key="in_review">In Review</SelectItem>
                           <SelectItem key="resolved">Resolved</SelectItem>
                        </Select>
                      </div>
                    </div>
                    <Divider className="my-4" />
                    <div>
                       <h4 className="font-black text-slate-800 mb-1">{c.subject}</h4>
                       <p className="text-sm text-slate-500 leading-relaxed">{c.description}</p>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>

          <Tab key="timetable" title="Timetable Manager">
             <div className="pt-8">
                <Card className="border-none shadow-sm rounded-[32px] p-8 bg-indigo-900 text-white">
                   <h3 className="text-2xl font-black mb-2">Timetable Control</h3>
                   <p className="text-indigo-200 text-sm mb-6">Manage the weekly class schedule for all students.</p>
                   <Button color="primary" className="font-bold bg-white text-indigo-900 rounded-xl" startContent={<Plus size={18} />}>
                      Add Schedule Slot
                   </Button>
                </Card>
                {/* Timetable list component could go here */}
             </div>
          </Tab>
        </Tabs>
      </motion.main>

      <AddCourseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchData} />

      {selectedCourse && (
        <>
          <SetDeadlineModal isOpen={isDeadlineOpen} onClose={() => setIsDeadlineOpen(false)} course={selectedCourse} onSuccess={fetchData} />
          <MoveStudentModal isOpen={isMoveOpen} onClose={() => setIsMoveOpen(false)} course={selectedCourse} onSuccess={fetchData} />

          <Modal isOpen={isMergeOpen} onClose={() => setIsMergeOpen(false)} backdrop="blur" size="lg">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex items-center gap-2">
                    <Users className="text-indigo-600" />
                    <span>Merge Class Groups</span>
                  </ModalHeader>
                  <ModalBody className="space-y-6 py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Source Group (To be dissolved)</p>
                      <Select
                        placeholder="Select source group"
                        variant="bordered"
                        onSelectionChange={(keys) => setMergeOpenData({...mergeData, sourceGroupId: Array.from(keys)[0] as string})}
                      >
                        {selectedCourseGroups.map(g => (
                          <SelectItem key={g.id}>Group #{g.groupNumber} ({g.memberships.length} members)</SelectItem>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Destination</p>
                      <Select
                        placeholder="Select target group"
                        variant="bordered"
                        onSelectionChange={(keys) => setMergeOpenData({...mergeData, targetGroupId: Array.from(keys)[0] as string})}
                      >
                        {selectedCourseGroups.filter(g => g.id !== mergeData.sourceGroupId).map(g => (
                          <SelectItem key={g.id}>Group #{g.groupNumber} ({g.memberships.length} members)</SelectItem>
                        ))}
                      </Select>
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="light" onPress={onClose} className="font-bold">Cancel</Button>
                    <Button color="primary" className="bg-indigo-600 font-bold" onClick={handleMerge}>Confirm Merge</Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </div>
  );
}
