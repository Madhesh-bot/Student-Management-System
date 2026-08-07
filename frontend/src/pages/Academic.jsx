import React, { useState, useEffect } from 'react';
import departmentService from '../services/departmentService';
import subjectService from '../services/subjectService';
import authService from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const Academic = () => {
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser && currentUser.role === 'admin';

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Department form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Subject form
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjDept, setSubjDept] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [deptRes, subjRes] = await Promise.all([
        departmentService.getDepartments(),
        subjectService.getSubjects()
      ]);
      setDepartments(deptRes.data.data || []);
      setSubjects(subjRes.data.data || []);

      if (deptRes.data.data && deptRes.data.data.length > 0) {
        setSubjDept(deptRes.data.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve academic registry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      setError('Please provide department name and code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await departmentService.addDepartment({ dept_name: deptName, code: deptCode });
      setSuccess('Department registered successfully.');
      setDeptName('');
      setDeptCode('');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to create department.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubj = async (e) => {
    e.preventDefault();
    if (!subjName || !subjCode || !subjDept) {
      setError('Please provide subject name, code and department.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await subjectService.addSubject({
        subject_name: subjName,
        subject_code: subjCode,
        department_id: parseInt(subjDept)
      });
      setSuccess('Subject registered successfully.');
      setSubjName('');
      setSubjCode('');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to create subject.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to remove this department? Warning: This will cascade to all related subjects and timetables!')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await departmentService.deleteDepartment(id);
      setSuccess('Department deleted successfully.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete department.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubj = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject registry?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await subjectService.deleteSubject(id);
      setSuccess('Subject deleted successfully.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Failed to delete subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academic-wrapper space-y-8">
      <div>
        <h1 className="page-title text-2xl font-extrabold tracking-tight">Academic Organization</h1>
        <p style={{ color: 'var(--neutral-400)' }} className="text-sm">
          Configure departments, curriculum subject registers, and academic structures.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {loading && (
        <div className="flex justify-center p-8">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Department Card */}
          <div className="space-y-6">
            {isAdmin && (
              <Card style={{ padding: '24px' }}>
                <h3 className="text-lg font-bold mb-4">Add Department</h3>
                <form onSubmit={handleAddDept} className="space-y-4">
                  <div>
                    <label className="form-label">Department Name</label>
                    <Input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Department Code</label>
                    <Input
                      type="text"
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      placeholder="e.g. CS"
                      required
                    />
                  </div>
                  <Button type="submit" className="btn-primary w-full">
                    Register Department
                  </Button>
                </form>
              </Card>
            )}

            <Card style={{ padding: '24px' }}>
              <h3 className="text-lg font-bold mb-4">Departments Directory</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Dept Name</th>
                      <th>Code</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {departments.length > 0 ? (
                      departments.map((dept) => (
                        <tr key={dept.id}>
                          <td><strong>{dept.dept_name}</strong></td>
                          <td><span className="badge badge-success">{dept.code}</span></td>
                          {isAdmin && (
                            <td>
                              <Button
                                onClick={() => handleDeleteDept(dept.id)}
                                className="btn-danger"
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              >
                                Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 3 : 2} style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>
                          No departments configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Subject Card */}
          <div className="space-y-6">
            {isAdmin && (
              <Card style={{ padding: '24px' }}>
                <h3 className="text-lg font-bold mb-4">Add Subject Track</h3>
                <form onSubmit={handleAddSubj} className="space-y-4">
                  <div>
                    <label className="form-label">Subject Name</label>
                    <Input
                      type="text"
                      value={subjName}
                      onChange={(e) => setSubjName(e.target.value)}
                      placeholder="e.g. Data Structures"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Subject Code</label>
                      <Input
                        type="text"
                        value={subjCode}
                        onChange={(e) => setSubjCode(e.target.value)}
                        placeholder="e.g. CS202"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Department</label>
                      <select
                        value={subjDept}
                        onChange={(e) => setSubjDept(e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--neutral-300)', borderRadius: 'var(--border-radius-sm)', background: 'transparent' }}
                      >
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.dept_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="btn-primary w-full">
                    Register Subject
                  </Button>
                </form>
              </Card>
            )}

            <Card style={{ padding: '24px' }}>
              <h3 className="text-lg font-bold mb-4">Subjects Curriculum</h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Code</th>
                      <th>Dept</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length > 0 ? (
                      subjects.map((subj) => (
                        <tr key={subj.id}>
                          <td><strong>{subj.subject_name}</strong></td>
                          <td><span className="badge badge-warning">{subj.subject_code}</span></td>
                          <td>{subj.dept_name || `ID: ${subj.department_id}`}</td>
                          {isAdmin && (
                            <td>
                              <Button
                                onClick={() => handleDeleteSubj(subj.id)}
                                className="btn-danger"
                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                              >
                                Delete
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>
                          No subjects configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academic;
