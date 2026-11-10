import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'

type Ticket = {
  id: number
  title: string
  description: string
  requester: string
  priority: 'Low' | 'Normal' | 'High'
  status: 'Open' | 'In Progress' | 'Resolved'
  createdAt: string
}

type TicketDraft = Omit<Ticket, 'id' | 'createdAt'>
type Filter = 'All tickets' | Ticket['status']
const emptyDraft: TicketDraft = { title: '', description: '', requester: '', priority: 'Normal', status: 'Open' }

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filter, setFilter] = useState<Filter>('All tickets')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<TicketDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadTickets() {
    setError('')
    try {
      const response = await fetch('/api/tickets')
      if (!response.ok) throw new Error('Could not load tickets. Is the API running?')
      setTickets(await response.json() as Ticket[])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadTickets() }, [])

  const visibleTickets = useMemo(() => tickets.filter((ticket) => {
    const matchesFilter = filter === 'All tickets' || ticket.status === filter
    const matchesQuery = `${ticket.title} ${ticket.description} ${ticket.requester}`.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  }), [tickets, filter, query])

  function openNewTicket() {
    setEditingId(null)
    setDraft(emptyDraft)
    setModalOpen(true)
  }

  function openEditTicket(ticket: Ticket) {
    setEditingId(ticket.id)
    setDraft({ title: ticket.title, description: ticket.description, requester: ticket.requester, priority: ticket.priority, status: ticket.status })
    setModalOpen(true)
  }

  async function saveTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch(editingId ? `/api/tickets/${editingId}` : '/api/tickets', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!response.ok) throw new Error('Could not save ticket.')
      setModalOpen(false)
      await loadTickets()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong.')
    }
  }

  async function deleteTicket(ticket: Ticket) {
    if (!window.confirm(`Delete “${ticket.title}”?`)) return
    const response = await fetch(`/api/tickets/${ticket.id}`, { method: 'DELETE' })
    if (!response.ok) setError('Could not delete ticket.')
    else await loadTickets()
  }

  const filters: Filter[] = ['All tickets', 'Open', 'In Progress', 'Resolved']
  const counts = (status: Filter) => status === 'All tickets' ? tickets.length : tickets.filter((ticket) => ticket.status === status).length

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="SupportDesk home"><span className="brand-mark">S</span><span>support<span className="brand-light">desk</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Ticket views">
          {filters.map((item) => <button key={item} className={`nav-item ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>
            <span className="nav-icon">{item === 'All tickets' ? '▦' : item === 'Open' ? '◉' : item === 'In Progress' ? '◷' : '✓'}</span><span>{item}</span><span className="nav-count">{counts(item)}</span>
          </button>)}
        </nav>
        <div className="sidebar-footer"><span className="avatar">RP</span><span><strong>Robert Palmer</strong><small>Administrator</small></span><span className="more">···</span></div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{filter}</strong></div><div className="topbar-right"><span className="api-status"><i /> API connected</span><button className="help-button" aria-label="Help">?</button></div></header>
        <section className="page-content">
          <div className="page-heading"><div><p className="eyebrow">YOUR SUPPORT INBOX</p><h1>{filter}</h1><p className="subheading">Keep every customer conversation moving.</p></div><button className="primary-button" onClick={openNewTicket}><span>＋</span> New ticket</button></div>
          <div className="toolbar"><div className="result-count"><strong>{visibleTickets.length}</strong> {visibleTickets.length === 1 ? 'ticket' : 'tickets'}</div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets..." aria-label="Search tickets" /><kbd>⌘ K</kbd></label></div>
          {error && <div className="error-banner" role="alert">{error} <button onClick={() => void loadTickets()}>Retry</button></div>}
          <div className="ticket-table-wrap">
            <table className="ticket-table"><thead><tr><th>SUBJECT</th><th>REQUESTER</th><th>PRIORITY</th><th>STATUS</th><th>CREATED</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{loading ? <tr><td colSpan={6} className="empty-state">Loading tickets…</td></tr> : visibleTickets.length === 0 ? <tr><td colSpan={6} className="empty-state"><div className="empty-icon">▤</div><strong>{tickets.length === 0 ? 'Your inbox is clear' : 'No matching tickets'}</strong><span>{tickets.length === 0 ? 'Create a ticket to start organizing customer requests.' : 'Try another search or view.'}</span>{tickets.length === 0 && <button className="text-button" onClick={openNewTicket}>Create your first ticket <span>→</span></button>}</td></tr> : visibleTickets.map((ticket) => <tr key={ticket.id}>
                <td><button className="subject-button" onClick={() => openEditTicket(ticket)}>{ticket.title}</button><div className="ticket-preview">{ticket.description}</div></td>
                <td><span className="requester"><span className="requester-avatar">{ticket.requester.trim().slice(0, 1).toUpperCase()}</span>{ticket.requester}</span></td>
                <td><span className={`priority priority-${ticket.priority.toLowerCase()}`}><i />{ticket.priority}</span></td>
                <td><span className={`status status-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span></td>
                <td className="date-cell">{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                <td><div className="row-actions"><button aria-label={`Edit ${ticket.title}`} onClick={() => openEditTicket(ticket)}>Edit</button><button aria-label={`Delete ${ticket.title}`} onClick={() => void deleteTicket(ticket)}>×</button></div></td>
              </tr>)}</tbody>
            </table>
          </div>
          <footer className="table-footer">Showing <strong>{visibleTickets.length}</strong> of <strong>{tickets.length}</strong> tickets <span>•</span> All changes saved</footer>
        </section>
      </main>

      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><p className="eyebrow">TICKET DETAILS</p><h2 id="modal-title">{editingId ? 'Edit ticket' : 'Create a ticket'}</h2></div><button className="close-button" onClick={() => setModalOpen(false)} aria-label="Close">×</button></div>
        <form onSubmit={(event) => void saveTicket(event)} className="ticket-form">
          <label>Subject<input required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What does the customer need?" /></label>
          <label>Description<textarea required maxLength={2000} rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add details about this request…" /></label>
          <div className="form-row"><label>Requester<input required maxLength={120} value={draft.requester} onChange={(event) => setDraft({ ...draft, requester: event.target.value })} placeholder="Name" /></label><label>Priority<select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TicketDraft['priority'] })}><option>Low</option><option>Normal</option><option>High</option></select></label></div>
          {editingId && <label>Status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as TicketDraft['status'] })}><option>Open</option><option>In Progress</option><option>Resolved</option></select></label>}
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>Cancel</button><button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Create ticket'}</button></div>
        </form>
      </section></div>}
    </div>
  )
}

export default App
