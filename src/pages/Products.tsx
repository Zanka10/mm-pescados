import { useMemo, useState } from 'react'

type Product = {
  name: string
  price: number
  promoPrice?: number
  category: string
  stockKg: number
  image?: string
  minStockKg: number
}

const initialProducts: Product[] = [
  { name: 'Filé de salmão', price: 79.9, promoPrice: 69.9, category: 'Peixe', stockKg: 25, minStockKg: 15 },
  { name: 'Filé de tilápia', price: 24.9, promoPrice: 0, category: 'Peixe', stockKg: 120, minStockKg: 20 },
  { name: 'Camarão 1kg', price: 89.9, promoPrice: 0, category: 'Frutos do mar', stockKg: 35, minStockKg: 10 },
  { name: 'Lula Congelada', price: 34.5, promoPrice: 0, category: 'Frutos do mar', stockKg: 0, minStockKg: 5 },
  { name: 'Bacalhau', price: 62.0, promoPrice: 0, category: 'Peixe', stockKg: 50, minStockKg: 15 },
  { name: 'Sardinha', price: 12.9, promoPrice: 0, category: 'Peixe', stockKg: 200, minStockKg: 30 },
  { name: 'Polvo', price: 45.0, promoPrice: 0, category: 'Frutos do mar', stockKg: 8, minStockKg: 20 },
  { name: 'Filé de Merluza', price: 32.9, promoPrice: 0, category: 'Peixe', stockKg: 0, minStockKg: 10 },
]

export default function Products() {
  const [items, setItems] = useState<Product[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<'Todas' | 'Peixe' | 'Frutos do mar'>('Todas')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [form, setForm] = useState<Product>({ name: '', price: 0, category: 'Peixe', stockKg: 0, minStockKg: 0 })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      const matchesCategory = category === 'Todas' || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [items, search, category])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  function openAdd() {
    setEditingIndex(null)
    setForm({ name: '', price: 0, promoPrice: undefined, category: 'Peixe', stockKg: 0, minStockKg: 0 })
    setModalOpen(true)
  }

  function openEdit(index: number) {
    const globalIndex = (page - 1) * pageSize + index
    setEditingIndex(globalIndex)
    setForm(items[globalIndex])
    setModalOpen(true)
  }

  function remove(index: number) {
    const globalIndex = (page - 1) * pageSize + index
    const next = items.slice()
    next.splice(globalIndex, 1)
    setItems(next)
  }

  function setPhoto(index: number, file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const globalIndex = (page - 1) * pageSize + index
      const next = items.slice()
      next[globalIndex] = { ...next[globalIndex], image: reader.result as string }
      setItems(next)
    }
    reader.readAsDataURL(file)
  }
  // Imagens foram substituídas por ícones nos cards da tabela

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const next = items.slice()
    if (editingIndex == null) {
      next.unshift(form)
    } else {
      next[editingIndex] = form
    }
    setItems(next)
    setModalOpen(false)
  }

  function statusOf(p: Product): 'stock' | 'low' | 'none' {
    if (p.stockKg <= 0) return 'none'
    if (p.stockKg < p.minStockKg) return 'low'
    return 'stock'
  }

  function formatPrice(v: number) {
    return `R$ ${v.toFixed(2).replace('.', ',')}/kg`
  }

  return (
    <>
      <header className="main-header">
        <div>
          <h1 className="main-title">Produtos</h1>
          <p className="main-subtitle">Gerencie os produtos do painel</p>
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
            placeholder="Buscar por nome ou categoria"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <div className="products-filters">
        <label className="select">
          Categoria
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as 'Todas' | 'Peixe' | 'Frutos do mar')
            }
          >
            <option>Todas</option>
            <option>Peixe</option>
            <option>Frutos do mar</option>
          </select>
        </label>
      </div>

      <div className="card">
        <div className="table products">
          <div className="table-head">
            <div className="th col-prod">Produto</div>
            <div className="th col-cat">Categoria</div>
            <div className="th col-qty">Quantidade</div>
            <div className="th col-min">Estoque Min.</div>
            <div className="th col-price">Preço</div>
            <div className="th col-status">Status</div>
            <div className="th col-actions">Ações</div>
          </div>
          {current.map((p, idx) => (
            <div className="table-row" key={p.name + idx}>
              <div className="td col-prod">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="product-avatar"
                    role="button"
                    tabIndex={0}
                    onClick={() => document.getElementById(`prod-pic-${idx}`)?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') document.getElementById(`prod-pic-${idx}`)?.click()
                    }}
                    title="Adicionar foto"
                  >
                    {p.image ? (
                      <img src={p.image} alt={p.name} />
                    ) : (
                      <svg viewBox="0 0 24 24" className="avatar-icon">
                        <path d="M3 12c4-6 14-6 18 0-4 6-14 6-18 0zm7 0a2 2 0 1 0 2-2 2 2 0 0 0-2 2z" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id={`prod-pic-${idx}`}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setPhoto(idx, f)
                    }}
                  />
                  <div className="td-title">{p.name}</div>
                </div>
              </div>
              <div className="td col-cat">{p.category === 'Peixe' ? 'Peixes' : 'Frutos do Mar'}</div>
              <div className="td col-qty">
                <span style={{ color: p.stockKg <= 0 ? '#ff6b6b' : p.stockKg < p.minStockKg ? '#f2c94c' : '#cfd6e3' }}>
                  {p.stockKg} kg
                </span>
              </div>
              <div className="td col-min">{p.minStockKg} kg</div>
              <div className="td col-price">{formatPrice(p.price)}</div>
              <div className="td col-status">
                {statusOf(p) === 'stock' && <span className="status-badge status-ok">Em Estoque</span>}
                {statusOf(p) === 'low' && <span className="status-badge status-low">Estoque Baixo</span>}
                {statusOf(p) === 'none' && <span className="status-badge status-none">Sem Estoque</span>}
              </div>
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
            {Math.min(page * pageSize, filtered.length)} de {filtered.length} produtos
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
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal">
          <div className="modal-card">
            <div className="modal-title">{editingIndex == null ? 'Cadastrar produto' : 'Editar produto'}</div>
            <form className="modal-form" onSubmit={submitForm}>
              <label className="modal-field">
                <span>Nome</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </label>
              <label className="modal-field">
                <span>Preço (kg)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                />
              </label>
              <label className="modal-field">
                <span>Preço promocional (kg)</span>
                <input
                  type="number"
                  step="0.01"
                  value={form.promoPrice ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, promoPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                />
              </label>
              <label className="modal-field">
                <span>Categoria</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option>Peixe</option>
                  <option>Frutos do mar</option>
                </select>
              </label>
              <label className="modal-field">
                <span>Estoque (kg)</span>
                <input
                  type="number"
                  step="1"
                  value={form.stockKg}
                  onChange={(e) => setForm({ ...form, stockKg: Number(e.target.value) })}
                />
              </label>
              <label className="modal-field">
                <span>Estoque mínimo (kg)</span>
                <input
                  type="number"
                  step="1"
                  value={form.minStockKg}
                  onChange={(e) => setForm({ ...form, minStockKg: Number(e.target.value) })}
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
