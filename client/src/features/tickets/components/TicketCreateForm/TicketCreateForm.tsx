import { useNavigate } from 'react-router-dom';
import styles from './TicketForm.module.css';
import { useEffect, useRef, useState, type FormEvent, type SubmitEventHandler } from 'react';
import type { TicketPriority, CreateTicketData, TicketCategory } from '../../types/ticket.types';
import type { User } from '../../../users/types/user.types';
import axios from 'axios';

const API_URL = `http://localhost:4000/api`

export function TicketCreateForm() {
  const navigate = useNavigate();

  // Done 🔴 TODO:
  // 1. set up controlled component state for: title, description, priority, category,
  //    reporterName, reporterEmail, assigneeId
  // 2. fetch users from GET /api/users on mount (for the assignee dropdown)
  // 3. on submit, POST to /api/tickets with the form data,
  //    then navigate to /tickets/:id using the returned ticket id
  // 4. track a "submitting" state — disable the submit button and show "Saving..." while the request is in flight

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TicketPriority>('medium')
  const [category, setCategory] = useState<TicketCategory>('other')
  const [reporterName, setReporterName] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTicketData, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          signal: controller.signal
        })
        if (!controller.signal.aborted) {
          setUsers(response.data.data)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setUsersError(`Failed to load assignees. You can still create an unassigned ticket`)
        }
      } finally {
        if (!controller.signal.aborted) {
          setUsersLoading(false)
        }
      }
    }

    fetchUsers()

    return () => {
      controller.abort()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const nextErrors: typeof errors = {}
    if (title.trim().length < 5) {
      nextErrors.title = 'Title must be at least 5 characters'
    }
    if (!description.trim()) nextErrors.description = 'Description is required'
    if (!reporterName.trim()) nextErrors.reporterName = 'Reporter name is required'
    if (!/^\S+@\S+\.\S+$/.test(reporterEmail.trim())) nextErrors.reporterEmail = 'Invalid Email'

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    const data: CreateTicketData = {
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      reporterName: reporterName.trim(),
      reporterEmail: reporterEmail.trim(),
      assigneeId: assigneeId ? Number(assigneeId) : null
    }

    const controller = new AbortController()
    setSubmitting(true)

    try {
      const response = await axios.post(`${API_URL}/tickets`, data, {
        signal: controller.signal
      })
      if (!controller.signal.aborted) {
        navigate(`/tickets/${response.data.data.id}`)
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(axios.isAxiosError(error) ? error.response?.data.messsage || 'Failed to create ticket' : 'Failed to create ticket')
      }
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false)
      }
    }

  }

  return (
    <div className={styles.container}>
      <h1>Create Ticket</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input id="title" type="text" minLength={5}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          {errors.title && <p className={styles.error}>{errors.title}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description *</label>
          <textarea id="description" rows={6}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {errors.description && <p className={styles.error}>{errors.description}</p>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="priority">Priority *</label>
            <select id="priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TicketPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="category">Category *</label>
            <select id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value as TicketCategory)}
            >
              <option value="bug">Bug</option>
              <option value="feature_request">Feature Request</option>
              <option value="question">Question</option>
              <option value="account_issue">Account Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="reporterName">Reporter Name *</label>
            <input id="reporterName" type="text"
              value={reporterName}
              onChange={(event) => setReporterName(event.target.value)}
            />
            {errors.reporterName && <p className={styles.error}>{errors.reporterName}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor="reporterEmail">Reporter Email *</label>
            <input id="reporterEmail" type="email"
              value={reporterEmail}
              onChange={(event) => setReporterEmail(event.target.value)}
            />
            {errors.reporterEmail && <p className={styles.error}>{errors.reporterEmail}</p>}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="assigneeId">Assignee</label>
          <select id="assigneeId"
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
          >
            <option value="">{usersLoading ? 'Loading assignees' : 'Unassigned'}</option>
            {/* render one <option> per user from the fetched users list */}
            {users.map(user => <option key={user.id} value={user.id}>{user.displayName}</option>)}
          </select>
          {usersError && <p className={styles.error}>{usersError}</p>}
        </div>

        <div className={styles.actions}>
          <button type="submit" disabled={submitting} className={styles.submitButton}>
            {submitting ? 'saving...' : 'Create Ticket'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
