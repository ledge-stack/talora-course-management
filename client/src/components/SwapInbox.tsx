'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Avatar,
  Badge
} from "@heroui/react";
import { ArrowLeftRight, Check, X, Clock, Inbox, Send } from "lucide-react";
import api from '@/lib/api';

export default function SwapInbox() {
  const [requests, setRequests] = useState<{ incoming: any[], outgoing: any[] }>({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/groups/swap-requests');
      setRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch swap requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/groups/swap-request/${id}/approve`);
      fetchRequests();
      window.location.reload(); // Refresh to update group state
    } catch (err) {
      alert('Failed to approve swap');
    }
  };

  const handleUpdateStatus = async (id: number, status: 'REJECTED' | 'CANCELLED') => {
    try {
      await api.patch(`/groups/swap-request/${id}/status`, { status });
      fetchRequests();
    } catch (err) {
      alert('Action failed');
    }
  };

  if (loading) return null;

  if (requests.incoming.length === 0 && requests.outgoing.length === 0) return null;

  return (
    <div className="space-y-6 mb-12">
      {requests.incoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-indigo-700">
            <Badge color="danger" content={requests.incoming.length} shape="circle" size="sm">
              <div className="p-1">
                <Inbox size={20} />
              </div>
            </Badge>
            <h2 className="text-xl font-bold">Swap Requests Inbox</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {requests.incoming.map((req) => (
              <Card key={req.id} className="border-l-4 border-l-indigo-500 shadow-sm border-t border-r border-b border-gray-100">
                <CardBody className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={`https://i.pravatar.cc/150?u=${req.requester.studentId}`}
                        size="md"
                        isBordered
                        color="primary"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{req.requester.fullName}</p>
                        <p className="text-xs text-gray-500">{req.requester.studentId}</p>
                      </div>
                    </div>
                    <Chip size="sm" variant="flat" color="primary" className="font-bold">{req.courseUnit.code}</Chip>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-lg mb-4 flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Their Group</p>
                      <p className="text-sm font-bold text-indigo-700">#{req.requesterGroup.groupNumber}</p>
                    </div>
                    <ArrowLeftRight size={16} className="text-indigo-300" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase text-gray-400 font-bold">Your Group</p>
                      <p className="text-sm font-bold text-indigo-700">#{req.targetGroup.groupNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      color="primary"
                      className="flex-1 font-bold bg-indigo-600"
                      startContent={<Check size={16} />}
                      onClick={() => handleApprove(req.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="flex-1 font-bold"
                      startContent={<X size={16} />}
                      onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {requests.outgoing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Send size={18} />
            <h2 className="text-md font-bold uppercase tracking-wider">Sent Requests</h2>
          </div>
          <div className="space-y-2">
            {requests.outgoing.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {req.courseUnit.code}
                  </div>
                  <p className="text-sm text-gray-700">
                    Swap with <span className="font-bold">{req.targetUser.fullName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Chip size="sm" variant="dot" color="warning">Pending</Chip>
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    isIconOnly
                    onClick={() => handleUpdateStatus(req.id, 'CANCELLED')}
                  >
                    <X size={18} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Divider className="my-8" />
    </div>
  );
}
