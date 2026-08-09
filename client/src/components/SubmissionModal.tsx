'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  Divider,
  Listbox,
  ListboxItem
} from "@heroui/react";
import { FileUp, FileText, Download, CheckCircle2, AlertCircle, History } from "lucide-react";
import api from '@/lib/api';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  courseCode: string;
}

export default function SubmissionModal({ isOpen, onClose, groupId, courseCode }: SubmissionModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'danger' | null, message: string }>({ type: null, message: '' });

  useEffect(() => {
    if (isOpen) {
      fetchSubmissions();
    }
  }, [isOpen, groupId]);

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(`/submissions/${groupId}`);
      setSubmissions(response.data);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 25 * 1024 * 1024) {
        setStatus({ type: 'danger', message: 'File size exceeds 25MB limit.' });
        return;
      }
      setFile(selectedFile);
      setStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('groupId', groupId.toString());

    try {
      await api.post('/submissions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Assignment submitted successfully!' });
      setFile(null);
      fetchSubmissions();
    } catch (err: any) {
      setStatus({ type: 'danger', message: err.response?.data?.message || 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <FileUp size={20} />
                <span>Submit Work - {courseCode}</span>
              </div>
              <p className="text-xs font-normal text-gray-500">Max file size: 25MB. System will auto-rename your file.</p>
            </ModalHeader>
            <ModalBody className="py-4">
              {status.type && (
                <div className={`flex items-center gap-2 p-3 text-sm rounded-lg mb-4 ${
                  status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{status.message}</span>
                </div>
              )}

              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 relative group ${
                file ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-indigo-300'
              }`}>
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                <div className="relative z-0">
                  <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    file ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-gray-400 border border-gray-100'
                  }`}>
                    {file ? <CheckCircle2 size={28} /> : <FileUp size={28} />}
                  </div>
                  <p className={`text-sm font-bold ${file ? 'text-indigo-600' : 'text-gray-700'}`}>
                    {file ? file.name : "Select your assignment file"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Click or drag to select PDF, ZIP, or DOCX"}
                  </p>
                </div>
              </div>

              {loading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-indigo-600 uppercase">
                    <span>Uploading...</span>
                    <span>Please wait</span>
                  </div>
                  <Progress size="sm" isIndeterminate color="primary" className="h-1.5" />
                </div>
              )}

              <div className="mt-8">
                <div className="flex items-center gap-2 mb-3 text-gray-500">
                  <History size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Submission History</span>
                </div>
                <Divider className="mb-3" />

                <div className="max-h-[200px] overflow-y-auto">
                  {submissions.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">No previous submissions found.</p>
                  ) : (
                    <div className="space-y-2">
                      {submissions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:border-indigo-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-indigo-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{s.fileName}</span>
                              <span className="text-[10px] text-gray-400">
                                v{s.version} • {new Date(s.submittedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button isIconOnly variant="light" size="sm" className="text-indigo-600">
                            <Download size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} className="font-bold">
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleUpload}
                disabled={!file || loading}
                isLoading={loading}
                className="font-bold bg-indigo-600"
              >
                Upload & Submit
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
