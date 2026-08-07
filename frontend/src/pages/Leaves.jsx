import React, { useState, useEffect } from 'react';
import leaveService from '../services/leaveService';
import authService from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const Leaves = () => {
  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser && currentUser.role === 'student';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'

  // Form fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await leaveService.getLeaves();
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setLeaves(list);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve leave records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await leaveService.requestLeave(startDate, endDate, reason);
      setSuccess('Leave request submitted successfully.');
      setStartDate('');
      setEndDate('');
      setReason('');
      setViewMode('list');
      await fetchLeaves();
    } catch (err) {
      console.error(err);
      setError('Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecideLeave = async (leaveId, status) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await leaveService.decideLeave(leaveId, status);
      setSuccess(`Leave request has been ${status.toLowerCase()} successfully.`);
      await fetchLeaves();
    } catch (err) {
      console.error(err);
      setError('Failed to update leave request status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaves-wrapper space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title text-2xl font-extrabold tracking-tight">Leave Management</h1>
          <p style={{ color: 'var(--neutral-400)' }} className="text-sm">
            {isStudent ? 'Submit leave requests and track approvals.' : 'Review and approve/reject leave requests.'}
          </p>
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)', overflow: 'hidden' }}>
          <button
            onClick={() => { setViewMode('list'); setError(null); setSuccess(null); }}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: viewMode === 'list' ? 'var(--primary)' : 'var(--bg-panel)',
              color: viewMode === 'list' ? 'var(--text-light)' : 'var(--neutral-700)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Leaves Log
          </button>
          {isStudent && (
            <button
              onClick={() => { setViewMode('form'); setError(null); setSuccess(null); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: viewMode === 'form' ? 'var(--primary)' : 'var(--bg-panel)',
                color: viewMode === 'form' ? 'var(--text-light)' : 'var(--neutral-700)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Request Leave
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && (
        <div className="flex justify-center p-8">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && viewMode === 'list' && (
        <Card>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  {!isStudent && <th>Student</th>}
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {!isStudent && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave.id}>
                      {!isStudent && (
                        <td>
                          <strong>{leave.student_name || `ID: ${leave.student_id}`}</strong>
                          <span className="block text-xs" style={{ color: 'var(--neutral-400)' }}>
                            {leave.register_number}
                          </span>
                        </td>
                      )}
                      <td>{leave.start_date ? new Date(leave.start_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{leave.end_date ? new Date(leave.end_date).toLocaleDateString() : 'N/A'}</td>
                      <td>{leave.reason}</td>
                      <td>
                        <span className={`badge badge-${
                          leave.status === 'Approved' ? 'success' : 
                          leave.status === 'Rejected' ? 'danger' : 'warning'
                        }`}>
                          {leave.status}
                        </span>
                      </td>
                      {!isStudent && (
                        <td>
                          {leave.status === 'Pending' ? (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleDecideLeave(leave.id, 'Approved')}
                                className="btn-primary"
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleDecideLeave(leave.id, 'Rejected')}
                                className="btn-danger"
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--neutral-400)', fontSize: '0.88rem' }}>Closed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isStudent ? 4 : 6} style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: '24px 0' }}>
                      No leave requests recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!loading && viewMode === 'form' && isStudent && (
        <Card style={{ maxWidth: '600px' }}>
          <h3 className="mb-4" style={{ fontWeight: 'bold' }}>Request Absence Leave</h3>
          <form onSubmit={handleRequestLeave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                className="form-input"
                style={{ resize: 'none', border: '1px solid var(--neutral-300)', width: '100%', borderRadius: 'var(--border-radius-sm)', padding: '10px 14px' }}
                placeholder="Reason for leave request..."
              />
            </div>
            <Button type="submit" className="btn-primary w-full">
              Submit Leave Request
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Leaves;
