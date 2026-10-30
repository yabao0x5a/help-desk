import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./LoginForm.module.css";
import axios from "axios";

const API_URL = `http://localhost:4000/api`

export function LoginForm() {
  // 🔴 Todo: implement login logic.
  // 1. handle the form submission and validation logic.
  //    - username: admin, alice, bob, carol, or dave
  //    - password: 123
  // 2. call the login API with axios and handle the response. api: POST http://localhost:4000/api/users/login
  // 3. display error message if login fails.
  // 4. on successful login, update the auth context with the user information
  //    (the dropdown closes by itself, because UserBadge re-renders once there is a user).

  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!username.trim() || !password) {
      setError('username and password are required')
      return
    }

    const controller = new AbortController()
    setSubmitting(true)

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        username: username.trim(),
        password
      }, {
        signal: controller.signal
      })

      if (!controller.signal.aborted) login(response.data.data)
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(axios.isAxiosError(error) ? error.response?.data?.message || 'failed to login' : 'failed to login')
      }
    } finally {
      if (!controller.signal.aborted) {
        setSubmitting(false)
      }
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label}>Username</label>
          <input type="text" className={styles.input}
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={submitting}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Password</label>
          <input type="password" className={styles.input}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.submit}>
          Login
          {submitting ? 'Logging in ...' : 'Login'}
        </button>
      </form>
      <div className={styles.hint}>
        <p>Try: admin, alice, bob, carol, or dave</p>
        <p>Password: 123</p>
      </div>
    </>
  );
}
