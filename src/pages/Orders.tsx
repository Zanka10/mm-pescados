import { useMemo, useState } from 'react'

type OrderStatus = 'Pendente' | 'Em andamento' | 'Concluido' | 'Cancelado'
type Payment = 'Cartão' | 'Dinheiro' | 'Pix' | 'Pend.'
export type OrderItem = {
  productName: string
  quantity: number
  price: number
}

export type Order = {
  id: number
  clientName: string
  clientPhone: string
  date: number
  createdAt: number
  total: number
  payment: Payment
  status: OrderStatus
  items?: OrderItem[]
}

const now = Date.now()
const day = 24 * 60 * 60 * 1000
const initialOrders: Order[] = []

export default function Orders() {
  const [items, setItems] = useState<Order[]>(() => {
    const stored = localStorage.getItem('mm-orders')
    return stored ? (JSON.parse(stored) as Order[]) : initialOrders
  })
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<'Todos' | OrderStatus>('Todos')
  const [period, setPeriod] = useState<'Hoje' | 'Últimos 7 dias' | 'Últimos 30 dias' | 'Todos'>('Últimos 7 dias')
  const [pageSize, setPageSize] = useState(5)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<Partial<Order>>({
    clientName: '',
    clientPhone: '',
    total: 0,
    payment: 'Pix',
    status: 'Pendente'
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const startDate =
      period === 'Hoje' ? new Date().setHours(0, 0, 0, 0) :
      period === 'Últimos 7 dias' ? now - 7 * day :
      period === 'Últimos 30 dias' ? now - 30 * day : 0
    return items.filter((o) => {
      const matchesSearch =
        !q ||
        String(o.id).includes(q) ||
        o.clientName.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q)
      const matchesStatus = statusTab === 'Todos' || o.status === statusTab
      const matchesPeriod = o.date >= startDate
      return matchesSearch && matchesStatus && matchesPeriod
    })
  }, [items, search, statusTab, period])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const totalAmount = useMemo(() => filtered.reduce((acc, o) => acc + o.total, 0), [filtered])

  function formatCurrency(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatDate(ts: number) {
    const diff = Math.floor((now - ts) / day)
    if (diff <= 0) return 'Hoje'
    if (diff === 1) return 'Ontem'
    return `${diff} dias`
  }
  function formatTime(ts: number) {
    const d = new Date(ts)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  function remove(id: number) {
    if (!confirm('Deseja realmente excluir este pedido?')) return
    const next = items.filter(o => o.id !== id)
    setItems(next)
    localStorage.setItem('mm-orders', JSON.stringify(next))
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clientName?.trim() || !form.total) return

    const newOrder: Order = {
      id: items.length > 0 ? Math.max(...items.map(o => o.id)) + 1 : 1,
      clientName: form.clientName || '',
      clientPhone: form.clientPhone || '',
      total: form.total || 0,
      payment: (form.payment as Payment) || 'Pix',
      status: (form.status as OrderStatus) || 'Pendente',
      items: [],
      date: Date.now(),
      createdAt: Date.now()
    }

    const next = [newOrder, ...items]
    setItems(next)
    localStorage.setItem('mm-orders', JSON.stringify(next))
    setModalOpen(false)
    setForm({ clientName: '', clientPhone: '', total: 0, payment: 'Pix', status: 'Pendente' })
  }

  return (
    <>
      <header className="main-header">
        <div>
          <h1 className="main-title">Pedidos</h1>
          <p className="main-subtitle">Gerencie os pedidos da loja</p>
        </div>
        <button className="button button-success" onClick={() => {
          setForm({ clientName: '', clientPhone: '', total: 0, payment: 'Pix', status: 'Pendente' });
          setModalOpen(true);
        }}>
          <span className="button-icon">
            <svg viewBox="0 0 24 24">
              <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
            </svg>
          </span>
          Cadastrar
        </button>
      </header>

      <div className="toolbar">
        <div className="search">
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
          </svg>
          <input
            className="search-input"
            placeholder="Buscar por ID, cliente ou status"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <label className="select">
          Período
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as typeof period)
              setPage(1)
            }}
          >
            <option>Hoje</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
            <option>Todos</option>
          </select>
        </label>
      </div>

      <div className="orders-tabs">
        {['Todos', 'Pendentes', 'Em andamento', 'Concluidos', 'Cancelados'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${statusTab === (tab === 'Pendentes' ? 'Pendente' : tab === 'Concluidos' ? 'Concluido' : tab === 'Cancelados' ? 'Cancelado' : tab) ? 'active' : ''}`}
            onClick={() => {
              const map = tab === 'Pendentes' ? 'Pendente' : tab === 'Concluidos' ? 'Concluido' : tab === 'Cancelados' ? 'Cancelado' : tab
              setStatusTab(map as any); setPage(1)
            }}
          >
            {tab}
          </button>
        ))}
        <div className="orders-total">Total: {filtered.length} | {formatCurrency(totalAmount)}</div>
      </div>

      <div className="card">
        <div className="table orders">
          <div className="table-head">
            <div className="th">Pedido</div>
            <div className="th">Cliente</div>
            <div className="th">Data</div>
            <div className="th">Total</div>
            <div className="th">Pagamento</div>
            <div className="th">Status</div>
            <div className="th">Ações</div>
          </div>
          {current.map((o) => (
            <div className="table-row" key={o.id}>
              <div className="td">#{o.id}</div>
              <div className="td">
                <div className="td-title">{o.clientName}</div>
                <div className="td-sub">{o.clientPhone}</div>
              </div>
              <div className="td">
                <div className="td-title">{formatDate(o.date)} às {formatTime(o.date)}</div>
                <div className="td-sub">{formatDate(o.createdAt)} - {formatTime(o.createdAt)}</div>
              </div>
              <div className="td">{formatCurrency(o.total)}</div>
              <div className="td">
                <span className={`pay-chip ${o.payment === 'Cartão' ? 'pay-card' : o.payment === 'Dinheiro' ? 'pay-money' : o.payment === 'Pix' ? 'pay-pix' : 'pay-pending'}`}>
                  {o.payment}
                </span>
              </div>
              <div className="td">
                <span className={`status-chip ${o.status === 'Pendente' ? 'chip-pending' : o.status === 'Em andamento' ? 'chip-progress' : o.status === 'Concluido' ? 'chip-done' : o.status === 'Cancelado' ? 'chip-cancel' : ''}`}>
                  {o.status}
                </span>
              </div>
              <div className="td col-actions">
                <button className="button button-pdf">
                  <span className="button-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M6 2h9l5 5v15H6zM8 9h8v2H8zm0 4h8v2H8z" />
                    </svg>
                  </span>
                  PDF
                </button>
                <button className="button button-delete" onClick={() => remove(o.id)}>
                  <span className="button-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zm3.46-9h1.5v8h-1.5zm5.58 0h1.5v8h-1.5zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </span>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="table-footer">
          <div>
            Mostrando {Math.min((page - 1) * pageSize + 1, filtered.length)} até {Math.min(page * pageSize, filtered.length)} de {filtered.length} pedidos
          </div>
          <div className="pager">
            <label className="pager-size">
              Itens por página
              <select
                value={pageSize}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setPageSize(v)
                  setPage(1)
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
              </select>
            </label>
            <div className="pager-buttons">
              <button className="pager-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                {'<'}
              </button>
              <button
                className="pager-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {'>'}
              </button>
              <div className="pager-pages">
                {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={`pager-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-title">Cadastrar Pedido</div>
            <form className="modal-form" onSubmit={submitForm}>
              <label className="modal-field">
                <span>Nome do Cliente</span>
                <input 
                  value={form.clientName} 
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })} 
                  required 
                />
              </label>
              <label className="modal-field">
                <span>Telefone</span>
                <input 
                  value={form.clientPhone} 
                  onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} 
                />
              </label>
              <label className="modal-field">
                <span>Total (R$)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.total || ''}
                  onChange={(e) => setForm({ ...form, total: Number(e.target.value) })}
                  required
                />
              </label>
              <label className="modal-field">
                <span>Forma de Pagamento</span>
                <select
                  value={form.payment}
                  onChange={(e) => setForm({ ...form, payment: e.target.value as Payment })}
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pend.">Pendente</option>
                </select>
              </label>
              <label className="modal-field">
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as OrderStatus })}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluido">Concluido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="button" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="button button-success">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
