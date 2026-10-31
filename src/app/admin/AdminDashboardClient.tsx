'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ExternalLink,
  Check,
  X,
  Edit3,
  LogOut,
  Globe,
  Loader2,
  Clock,
} from 'lucide-react';
import { getTierStyles } from '@/components/PlaqueCard';
import { Plaque, Wing } from '@/lib/types';

interface AdminDashboardClientProps {
  initialPending: Plaque[];
  initialApproved: Plaque[];
  initialRejected: Plaque[];
  wings: Wing[];
  user: { name: string; email: string };
}

function timeAgo(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return 'Recently';
  }
}

export default function AdminDashboardClient({
  initialPending,
  initialApproved,
  initialRejected,
  wings,
  user,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const [pendingList, setPendingList] = useState<Plaque[]>(initialPending);
  const [approvedList, setApprovedList] = useState<Plaque[]>(initialApproved);
  const [rejectedList, setRejectedList] = useState<Plaque[]>(initialRejected);

  // Current list based on active tab
  const currentList =
    activeTab === 'pending'
      ? pendingList
      : activeTab === 'approved'
      ? approvedList
      : rejectedList;

  // Selected item for review
  const [selectedId, setSelectedId] = useState<number | null>(
    currentList.length > 0 ? currentList[0].id : null
  );

  const selectedPlaque =
    currentList.find(p => p.id === selectedId) || (currentList.length > 0 ? currentList[0] : null);

  // Action states
  const [rejectionNote, setRejectionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editWingId, setEditWingId] = useState('');
  const [editTier, setEditTier] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editDeptBatch, setEditDeptBatch] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editProofUrl, setEditProofUrl] = useState('');

  const openEditModal = (p: Plaque) => {
    setEditName(p.name);
    setEditTitle(p.title);
    setEditWingId(p.wing_id);
    setEditTier(p.tier);
    setEditYear(p.year);
    setEditDeptBatch(p.dept_batch || '');
    setEditStory(p.story || '');
    setEditProofUrl(p.proof_url || '');
    setEditModalOpen(true);
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleApprove = async () => {
    if (!selectedPlaque) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/plaques/${selectedPlaque.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error('Failed to approve');

      const updated = {
        ...selectedPlaque,
        status: 'approved' as const,
        approved_at: new Date().toISOString(),
      };

      setPendingList(prev => prev.filter(p => p.id !== selectedPlaque.id));
      setRejectedList(prev => prev.filter(p => p.id !== selectedPlaque.id));
      setApprovedList(prev => [updated, ...prev]);

      // Move selection to next item if any
      const remaining = pendingList.filter(p => p.id !== selectedPlaque.id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      console.error(err);
      alert('Failed to approve nomination.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPlaque) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/plaques/${selectedPlaque.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_note: rejectionNote,
        }),
      });
      if (!res.ok) throw new Error('Failed to reject');

      const updated = {
        ...selectedPlaque,
        status: 'rejected' as const,
        rejection_note: rejectionNote,
      };

      setPendingList(prev => prev.filter(p => p.id !== selectedPlaque.id));
      setApprovedList(prev => prev.filter(p => p.id !== selectedPlaque.id));
      setRejectedList(prev => [updated, ...prev]);
      setRejectionNote('');

      const remaining = pendingList.filter(p => p.id !== selectedPlaque.id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    } catch (err) {
      console.error(err);
      alert('Failed to reject nomination.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaque) return;
    setActionLoading(true);
    try {
      const wingObj = wings.find(w => w.id === editWingId);
      const res = await fetch(`/api/plaques/${selectedPlaque.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          title: editTitle,
          wing_id: editWingId,
          wing_name: wingObj?.name || selectedPlaque.wing_name,
          tier: editTier,
          year: editYear,
          dept_batch: editDeptBatch,
          story: editStory,
          proof_url: editProofUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');

      const updated = data.plaque;

      const updateInList = (list: Plaque[]) =>
        list.map(item => (item.id === updated.id ? updated : item));

      setPendingList(updateInList);
      setApprovedList(updateInList);
      setRejectedList(updateInList);
      setEditModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update plaque details');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedTierStyles = selectedPlaque ? getTierStyles(selectedPlaque.tier) : null;

  return (
    <div className="flex h-screen bg-[#0C1424] text-[#F5EEDC] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-[#101A2C] border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex">
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg
              width="36"
              height="36"
              viewBox="0 0 72 72"
              aria-hidden="true"
            >
              <circle
                cx="36"
                cy="36"
                r="33"
                fill="none"
                stroke="#F2B84B"
                strokeWidth="3"
              />
              <polygon
                points="36,14 41.3,28.7 56.9,29.2 44.6,38.8 48.9,53.8 36,45 23.1,53.8 27.4,38.8 15.1,29.2 30.7,28.7"
                fill="#F2B84B"
              />
            </svg>
            <div className="flex flex-col leading-[1.15]">
              <span className="font-heading font-extrabold text-[18px]">
                Curator&apos;s Desk
              </span>
              <span className="text-[11px] text-[#A9B3C7] tracking-[0.1em] uppercase">
                Admin
              </span>
            </div>
          </div>

          {/* Add Legend Primary Button */}
          <Link
            href="/admin/add"
            style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
            className="btn-gold flex items-center justify-center gap-2 min-h-[46px] rounded-full !text-[#101A2C] font-bold text-[15px] no-underline shadow-sm transition-all"
          >
            <Plus size={18} strokeWidth={2.4} />
            Add legend
          </Link>

          {/* Nav Tabs */}
          <nav className="flex flex-col gap-1.5 font-bold text-[15px]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('pending');
                if (pendingList.length > 0) setSelectedId(pendingList[0].id);
              }}
              className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-[10px] text-left cursor-pointer transition-colors ${
                activeTab === 'pending'
                  ? 'bg-[#F2B84B]/15 text-[#F2B84B]'
                  : 'text-[#F5EEDC] hover:bg-white/5'
              }`}
            >
              <span>Pending</span>
              <span className="bg-[#F2B84B] text-[#101A2C] rounded-full px-2.5 py-0.5 text-[12px] font-bold">
                {pendingList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('approved');
                if (approvedList.length > 0) setSelectedId(approvedList[0].id);
              }}
              className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-[10px] text-left cursor-pointer transition-colors ${
                activeTab === 'approved'
                  ? 'bg-[#F2B84B]/15 text-[#F2B84B]'
                  : 'text-[#F5EEDC] hover:bg-white/5'
              }`}
            >
              <span>Approved</span>
              <span className="text-[#A9B3C7] text-xs font-normal">
                {approvedList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('rejected');
                if (rejectedList.length > 0) setSelectedId(rejectedList[0].id);
              }}
              className={`flex items-center justify-between min-h-[44px] px-3.5 rounded-[10px] text-left cursor-pointer transition-colors ${
                activeTab === 'rejected'
                  ? 'bg-[#F2B84B]/15 text-[#F2B84B]'
                  : 'text-[#F5EEDC] hover:bg-white/5'
              }`}
            >
              <span>Rejected</span>
              <span className="text-[#A9B3C7] text-xs font-normal">
                {rejectedList.length}
              </span>
            </button>

            <Link
              href="/admin/wings"
              className="flex items-center min-h-[44px] px-3.5 rounded-[10px] text-[#F5EEDC] hover:bg-white/5 no-underline transition-colors"
            >
              Manage wings
            </Link>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-3 text-[14px] pt-6 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-[#F5EEDC] hover:text-[#F2B84B] no-underline"
          >
            <Globe size={16} />
            View public site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[#A9B3C7] hover:text-white bg-transparent border-0 p-0 text-left cursor-pointer"
          >
            <LogOut size={16} />
            Sign out ({user.name})
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex-shrink-0 flex items-center justify-between gap-6 px-6 sm:px-8 py-5 border-b border-white/10 bg-[#101A2C]">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-heading font-extrabold text-[26px] sm:text-[30px] leading-[1.1] capitalize">
              {activeTab} nominations
            </h1>
            <span className="text-[13px] text-[#A9B3C7]">
              {activeTab === 'pending'
                ? 'Nothing goes public until you approve it.'
                : activeTab === 'approved'
                ? 'These plaques are currently live on the campus wall of honour.'
                : 'Nominations declined by the Curator.'}
            </span>
          </div>

          {/* Quick tab switcher for mobile/desktop */}
          <div className="flex gap-1.5 p-1 rounded-full bg-[#182640]">
            {(['pending', 'approved', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  const list = tab === 'pending' ? pendingList : tab === 'approved' ? approvedList : rejectedList;
                  if (list.length > 0) setSelectedId(list[0].id);
                }}
                className={`min-h-[36px] px-4 rounded-full font-bold text-[13px] capitalize cursor-pointer transition-colors ${
                  activeTab === tab
                    ? 'bg-[#F2B84B] btn-gold !text-[#101A2C]'
                    : 'text-[#F5EEDC] hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* 2-Column Split: Queue (Left) & Review (Right) */}
        <div className="flex-1 flex min-h-0 overflow-hidden flex-col md:flex-row">
          {/* Left Column: Nomination Queue list */}
          <div className="w-full md:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-white/10 p-4 sm:p-5 flex flex-col gap-3 overflow-y-auto bg-[#0C1424]">
            {currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-[#A9B3C7] text-sm text-center">
                <span>No nominations in {activeTab} queue.</span>
              </div>
            ) : (
              currentList.map(item => {
                const isSelected = selectedPlaque?.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex flex-col gap-2 p-4 rounded-[14px] text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#F2B84B]/15 border-2 border-[#F2B84B]'
                        : 'bg-[#182640] border-2 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-extrabold text-[17px] text-[#F5EEDC]">
                        {item.name}
                      </span>
                      <span className="text-[12px] text-[#A9B3C7] flex items-center gap-1">
                        <Clock size={12} />
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                    <span className="text-[13px] leading-[1.4] text-[#A9B3C7] line-clamp-2">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold border border-[#F5EEDC]/35 rounded-full px-2.5 py-0.5 text-[#F5EEDC]">
                        {item.wing_name}
                      </span>
                      <span className="text-[11px] text-[#A9B3C7]">
                        {item.year} · {item.tier}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Review Details & Actions */}
          <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto">
            {selectedPlaque ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <h2 className="m-0 font-heading font-extrabold text-[24px] sm:text-[26px]">
                    Review nomination
                  </h2>
                  <span
                    className={`text-[12px] font-bold border rounded-full px-3 py-1 uppercase tracking-wider ${
                      selectedPlaque.status === 'approved'
                        ? 'text-[#5BD6A4] border-[#5BD6A4] bg-[#5BD6A4]/10'
                        : selectedPlaque.status === 'rejected'
                        ? 'text-[#FF7A59] border-[#FF7A59] bg-[#FF7A59]/10'
                        : 'text-[#F2B84B] border-[#F2B84B] bg-[#F2B84B]/10'
                    }`}
                  >
                    {selectedPlaque.status}
                  </span>
                </div>

                {/* Plaque miniature and details */}
                <div className="flex flex-col xl:flex-row gap-6 items-start">
                  {/* Miniature plaque */}
                  <div className="w-[200px] flex-shrink-0 bg-[#F5EEDC] border-[6px] rounded-[6px] p-3 flex flex-col gap-2.5 shadow-md"
                    style={{ borderColor: selectedTierStyles?.frame || '#C9D2E0' }}
                  >
                    <div
                      style={{ backgroundColor: selectedTierStyles?.tint || '#D5DCE8' }}
                      className="h-[140px] rounded-[3px] overflow-hidden flex items-center justify-center font-heading font-extrabold text-[44px] text-[#101A2C]"
                    >
                      {selectedPlaque.photo_url ? (
                        <img
                          src={selectedPlaque.photo_url}
                          alt={selectedPlaque.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{selectedPlaque.initials}</span>
                      )}
                    </div>
                    <div className="font-heading font-extrabold text-[17px] text-[#101A2C] leading-[1.15] truncate">
                      {selectedPlaque.name}
                    </div>
                    <div className="text-[11px] font-bold text-[#101A2C]">
                      {selectedPlaque.year} · {selectedPlaque.tier}
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <dl className="m-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                        Achievement
                      </dt>
                      <dd className="m-0 text-[17px] font-heading font-bold text-[#F5EEDC] pt-1">
                        {selectedPlaque.title}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                        Wing
                      </dt>
                      <dd className="m-0 text-[15px] font-semibold text-[#F5EEDC] pt-1">
                        {selectedPlaque.wing_name}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                        Department and batch
                      </dt>
                      <dd className="m-0 text-[15px] text-[#F5EEDC] pt-1">
                        {selectedPlaque.dept_batch || 'None provided'}
                      </dd>
                    </div>

                    <div className="sm:col-span-2">
                      <dt className="text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                        Story
                      </dt>
                      <dd className="m-0 text-[14px] leading-[1.5] text-[#D8DEEA] pt-1 whitespace-pre-line">
                        {selectedPlaque.story || 'No story provided.'}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                        Proof
                      </dt>
                      <dd className="m-0 text-[14px] pt-1">
                        {selectedPlaque.proof_url ? (
                          <a
                            href={selectedPlaque.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#F2B84B] hover:underline"
                          >
                            Open proof link <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-[#A9B3C7]">No link attached</span>
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                        Submitted by (private)
                      </dt>
                      <dd className="m-0 text-[14px] text-[#A9B3C7] pt-1">
                        {selectedPlaque.submitter_name || 'Anonymous'}{' '}
                        {selectedPlaque.submitter_contact && `· ${selectedPlaque.submitter_contact}`}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Rejection / Note box if pending */}
                {selectedPlaque.status === 'pending' && (
                  <label className="flex flex-col gap-2 text-[13px] font-bold mt-2">
                    <span>Note to nominator (sent only if you reject)</span>
                    <textarea
                      rows={2}
                      value={rejectionNote}
                      onChange={e => setRejectionNote(e.target.value)}
                      placeholder="For example, please add a proof link or a clearer photo"
                      className="p-3 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[14px] outline-none focus:border-[#F2B84B] resize-none"
                    />
                  </label>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10 mt-auto">
                  {selectedPlaque.status !== 'approved' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleApprove}
                      className="inline-flex items-center gap-2 min-h-[48px] px-7 rounded-full bg-[#5BD6A4] hover:bg-[#6ef0ba] text-[#101A2C] font-bold text-[15px] cursor-pointer transition-all"
                    >
                      <Check size={18} strokeWidth={2.5} />
                      Approve and hang
                    </button>
                  )}

                  {selectedPlaque.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleReject}
                      className="inline-flex items-center gap-2 min-h-[48px] px-7 rounded-full border-[1.5px] border-[#FF7A59] text-[#FF7A59] hover:bg-[#FF7A59]/10 font-bold text-[15px] cursor-pointer transition-all"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openEditModal(selectedPlaque)}
                    className="inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full border-[1.5px] border-[#F5EEDC]/35 hover:border-white text-[#F5EEDC] font-bold text-[15px] cursor-pointer transition-all"
                  >
                    <Edit3 size={16} />
                    Edit details first
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#A9B3C7]">
                <span>Select a nomination from the list to review</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Details Modal */}
      {editModalOpen && selectedPlaque && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#182640] border border-white/20 rounded-[20px] p-6 sm:p-8 max-w-lg w-full flex flex-col gap-5 text-[#F5EEDC] shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="m-0 font-heading font-extrabold text-[22px]">
              Edit plaque details
            </h3>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-sm">
              <label className="flex flex-col gap-1.5 font-bold">
                <span>Legend Name</span>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                />
              </label>

              <label className="flex flex-col gap-1.5 font-bold">
                <span>Achievement Title</span>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 font-bold">
                  <span>Wing</span>
                  <select
                    value={editWingId}
                    onChange={e => setEditWingId(e.target.value)}
                    className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                  >
                    {wings.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 font-bold">
                  <span>Tier</span>
                  <select
                    value={editTier}
                    onChange={e => setEditTier(e.target.value)}
                    className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                  >
                    <option value="Campus">Campus</option>
                    <option value="National">National</option>
                    <option value="International">International</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 font-bold">
                  <span>Year</span>
                  <input
                    type="text"
                    value={editYear}
                    onChange={e => setEditYear(e.target.value)}
                    className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                  />
                </label>

                <label className="flex flex-col gap-1.5 font-bold">
                  <span>Dept & Batch</span>
                  <input
                    type="text"
                    value={editDeptBatch}
                    onChange={e => setEditDeptBatch(e.target.value)}
                    className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5 font-bold">
                <span>Story</span>
                <textarea
                  rows={3}
                  value={editStory}
                  onChange={e => setEditStory(e.target.value)}
                  className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                />
              </label>

              <label className="flex flex-col gap-1.5 font-bold">
                <span>Proof URL</span>
                <input
                  type="url"
                  value={editProofUrl}
                  onChange={e => setEditProofUrl(e.target.value)}
                  className="p-3 rounded-lg border border-white/20 bg-[#101A2C] text-[#F5EEDC]"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-white/20 text-[#A9B3C7] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-full bg-[#F2B84B] text-[#101A2C] font-bold hover:bg-[#FFD27A]"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

