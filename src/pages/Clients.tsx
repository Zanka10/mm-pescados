import { useMemo, useState } from 'react'

type Client = {
  name: string
  doc: string
  address: string
  phone: string
}

const initialClients: Client[] = []

export default function Clients() {
  const [items, setItems] = useState<Client[]>(() => {
    const stored = localStorage.getItem('mm-clients')
    return stored ? (JSON.parse(stored) as Client[]) : initialClients
  })
  const [search, setSearch] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [form, setForm] = useState<Client>({ name: '', doc: '', address: '', phone: '' })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.doc.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  function openAdd() {
    setEditingIndex(null)
    setForm({ name: '', doc: '', address: '', phone: '' })
    setModalOpen(true)
  }

  function openEdit(index: number) {
    const globalIndex = (page - 1) * pageSize + index
    setEditingIndex(globalIndex)
    setForm(items[globalIndex])
    setModalOpen(true)
  }

  function remove(index: number) {
    if (!confirm('Deseja realmente excluir este cliente?')) return
    const globalIndex = (page - 1) * pageSize + index
    const next = items.slice()
    next.splice(globalIndex, 1)
    setItems(next)
    localStorage.setItem('mm-clients', JSON.stringify(next))
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.doc.trim()) return
    const next = items.slice()
    if (editingIndex == null) {
      next.unshift(form)
    } else {
      next[editingIndex] = form
    }
    setItems(next)
    localStorage.setItem('mm-clients', JSON.stringify(next))
    setModalOpen(false)
  }

  return (
    <>
      <header className="main-header">
        <div>
          <h1 className="main-title">Clientes</h1>
          <p className="main-subtitle">Visualize e gerencie seus clientes</p>
        </div>
        <button className="button button-success" onClick={openAdd}>
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
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table">
          <div className="table-head">
            <div className="th col-name">Empresa / Cliente</div>
            <div className="th col-doc">CPF / CNPJ</div>
            <div className="th col-address">Endereço</div>
            <div className="th col-phone">Telefone</div>
            <div className="th col-actions">Ações</div>
          </div>
          {current.map((c, idx) => (
            <div className="table-row" key={c.name + idx}>
              <div className="td col-name">
                <div className="td-title">{c.name}</div>
                <div className="td-sub">{c.doc}</div>
              </div>
              <div className="td col-doc">{c.doc}</div>
              <div className="td col-address">
                {c.address.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
              <div className="td col-phone">{c.phone}</div>
              <div className="td col-actions">
                <button className="button button-edit" onClick={() => openEdit(idx)}>
                  <span className="button-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM17.66 3.41a1.996 1.996 0 1 1 2.82 2.82l-1.41 1.41-2.82-2.82z" />
                    </svg>
                  </span>
                  Alterar
                </button>
                <button className="button button-delete" onClick={() => remove(idx)}>
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
            Mostrando {Math.min((page - 1) * pageSize + 1, filtered.length)} até{' '}
            {Math.min(page * pageSize, filtered.length)} de {filtered.length} clientes
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
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>
            <div className="pager-buttons">
              <button
                className="pager-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                {'<'}
              </button>
              <button
                className="pager-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                {'>'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-title">{editingIndex == null ? 'Cadastrar' : 'Alterar'}</div>
            <form className="modal-form" onSubmit={submitForm}>
              <label className="modal-field">
                <span>Empresa / Cliente</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </label>
              <label className="modal-field">
                <span>CPF / CNPJ</span>
                <input
                  value={form.doc}
                  onChange={(e) => setForm({ ...form, doc: e.target.value })}
                  required
                />
              </label>
              <label className="modal-field">
                <span>Endereço</span>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </label>
              <label className="modal-field">
                <span>Telefone</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
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
