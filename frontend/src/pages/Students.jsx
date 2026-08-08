import React, { useState, useEffect } from 'react';
import studentService from '../services/studentService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import authService from '../services/authService';

/**
 * Students Management Page Component
 * Handles table listing, search queries, addition modals, and modification triggers.
 */
const Students = () => {
  const currentUser = authService.getCurrentUser();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal toggle states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form values
  const [formData, setFormData] = useState({
    register_number: '',
    student_name: '',
    department: '',
    year: '',
    section: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    photo_url: ''
  });

  const fetchStudents = async (pageNumber = 1) => {
    try {
      if (students.length === 0) setLoading(true);
      setError(null);
      const res = await studentService.getAllStudents(pageNumber, 10);
      const studentList = Array.isArray(res) ? res : (res?.data || res?.students || []);
      setStudents(studentList);
      if (res && res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setCurrentPage(res.pagination.page || 1);
        setTotalStudents(res.pagination.total || studentList.length);
      } else {
        setTotalPages(1);
        setCurrentPage(1);
        setTotalStudents(studentList.length);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load paginated list if not in search view
    if (!searchQuery) {
      fetchStudents(currentPage);
    }
  }, [currentPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchStudents();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await studentService.searchStudents(searchQuery);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setError('Search queries failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchStudents(1);
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      register_number: '',
      student_name: '',
      department: '',
      year: '',
      section: '',
      gender: '',
      email: '',
      phone: '',
      address: '',
      photo_url: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setModalMode('edit');
    setSelectedStudentId(student.id);
    setFormData({
      register_number: student.register_number,
      student_name: student.student_name,
      department: student.department,
      year: student.year,
      section: student.section,
      gender: student.gender,
      email: student.email,
      phone: student.phone || '',
      address: student.address || '',
      photo_url: student.photo_url || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormErrors({
      ...formErrors,
      [e.target.name]: ''
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.register_number.trim()) errors.register_number = 'Register number is required';
    if (!formData.student_name.trim()) errors.student_name = 'Student name is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.year) errors.year = 'Academic year is required';
    if (!formData.section.trim()) errors.section = 'Section is required';
    if (!formData.gender) errors.gender = 'Gender select is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (modalMode === 'add') {
        await studentService.addStudent(formData);
      } else {
        await studentService.updateStudent(selectedStudentId, formData);
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      console.error(err);
      const apiMsg = err.response?.data?.message || 'Failed to submit student record.';
      setFormErrors({ apiError: apiMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this student record? All related attendance and marks data will be lost.')) {
      return;
    }

    try {
      setLoading(true);
      await studentService.deleteStudent(id);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete student record.');
      setLoading(false);
    }
  };

  return (
    <div className="students-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Students</h1>
          <p style={{ color: 'var(--neutral-400)' }}>View, add, update, and search student profiles.</p>
        </div>
        
        {/* Only Admin/Staff can add students */}
        {currentUser && currentUser.role !== 'student' && (
          <Button variant="primary" onClick={handleOpenAddModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" x2="12" y1="5" y2="19"></line><line x1="5" x2="19" y1="12" y2="12"></line></svg>
            Add Student
          </Button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Options */}
      <form onSubmit={handleSearchSubmit} className="search-filters">
        <div className="search-box w-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search register #, name, department..."
            className="form-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
        {searchQuery && (
          <Button type="button" variant="secondary" onClick={handleClearSearch}>Clear</Button>
        )}
      </form>

      {/* Students Data Grid */}
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : students.length > 0 ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Register No</th>
                <th>Student Name</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Sec</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Phone</th>
                {currentUser && currentUser.role !== 'student' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td style={{ fontWeight: '600' }}>{student.register_number || student.reg_no || 'N/A'}</td>
                  <td>{student.student_name || student.name || 'Unknown Student'}</td>
                  <td>{student.department || student.dept_name || 'General'}</td>
                  <td>{student.year ? (String(student.year).includes('Year') ? student.year : `${student.year} Yr`) : '-'}</td>
                  <td>{student.section || 'A'}</td>
                  <td>{student.gender || '-'}</td>
                  <td>{student.email || '-'}</td>
                  <td>{student.phone || '-'}</td>
                  
                  {/* Actions column for admin/staff */}
                  {currentUser && currentUser.role !== 'student' && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenEditModal(student); }}
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                          title="Edit Student details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
                        </button>
                        
                        {/* Only Admin can delete students */}
                        {currentUser.role === 'admin' && (
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteStudent(student.id); }}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                            title="Delete Student"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
          No student records found in the database.
        </Card>
      )}

      {/* Pagination Controls */}
      {!searchQuery && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', marginBottom: '20px' }}>
          <Button
            variant="secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Previous
          </Button>
          <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--neutral-700)' }}>
            Page {currentPage} of {totalPages} (Total {totalStudents} Students)
          </span>
          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add / Edit Dialog overlay */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {modalMode === 'add' ? 'Add New Student' : 'Edit Student Details'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--neutral-400)' }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {formErrors.apiError && (
                  <div className="alert alert-danger" style={{ marginBottom: '16px' }}>
                    <span>{formErrors.apiError}</span>
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="grid-responsive">
                  <Input
                    label="Register Number"
                    name="register_number"
                    value={formData.register_number}
                    onChange={handleFormChange}
                    error={formErrors.register_number}
                    required
                    disabled={modalMode === 'edit'} // Lock primary identifier in edit
                  />
                  <Input
                    label="Student Name"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleFormChange}
                    error={formErrors.student_name}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }} className="grid-responsive">
                  <Input
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    error={formErrors.department}
                    required
                    placeholder="e.g. Computer Science"
                  />
                  <Input
                    label="Year"
                    name="year"
                    type="select"
                    value={formData.year}
                    onChange={handleFormChange}
                    error={formErrors.year}
                    required
                    options={[
                      { value: '1', label: '1st Year' },
                      { value: '2', label: '2nd Year' },
                      { value: '3', label: '3rd Year' },
                      { value: '4', label: '4th Year' }
                    ]}
                  />
                  <Input
                    label="Section"
                    name="section"
                    value={formData.section}
                    onChange={handleFormChange}
                    error={formErrors.section}
                    required
                    placeholder="e.g. A"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }} className="grid-responsive">
                  <Input
                    label="Gender"
                    name="gender"
                    type="select"
                    value={formData.gender}
                    onChange={handleFormChange}
                    error={formErrors.gender}
                    required
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' }
                    ]}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    error={formErrors.email}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }} className="grid-responsive">
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    placeholder="e.g. +1234567890"
                  />
                  <Input
                    label="Profile Photo URL"
                    name="photo_url"
                    value={formData.photo_url}
                    onChange={handleFormChange}
                    placeholder="e.g. https://example.com/photo.jpg"
                  />
                </div>

                <Input
                  label="Address"
                  name="address"
                  type="textarea"
                  value={formData.address}
                  onChange={handleFormChange}
                  rows={2}
                />
              </div>
              
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitting}>
                  {modalMode === 'add' ? 'Add Student' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 576px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};

export default Students;
