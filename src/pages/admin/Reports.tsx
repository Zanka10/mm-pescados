import { useMemo } from 'react'
import { storageService } from '../../services/storage.service'
import { formatCurrency } from '../../utils/formatters'

export default function Reports() {
  const orders = useMemo(() => storageService.getOrders(), [])

  const stats = useMemo(() => {
    const productSales: Record<string, { quantity: number, revenue: number }> = {}
    let totalRevenue = 0
    let totalItems = 0

    orders.forEach(order => {
      if (order.status === 'Concluido') {
        order.items?.forEach(item => {
          if (!productSales[item.productName]) {
            productSales[item.productName] = { quantity: 0, revenue: 0 }
          }
          productSales[item.productName].quantity += item.quantity
          productSales[item.productName].revenue += item.price * item.quantity
          totalRevenue += item.price * item.quantity
          totalItems += item.quantity
        })
      }
    })

    const sortedProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)

    return {
      productSales: sortedProducts,
      totalRevenue,
      totalItems,
      bestSeller: sortedProducts[0] || null
    }
  }, [orders])

  return (
    <>
      <header className="main-header">
        <div>
          <h1 className="main-title">Relatórios de Vendas</h1>
          <p className="main-subtitle">Análise detalhada de produtos e desempenho</p>
        </div>
      </header>

      <div className="reports-grid">
        <div className="card report-card">
          <div className="report-label">Faturamento Total (Concluídos)</div>
          <div className="report-value">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="card report-card">
          <div className="report-label">Itens Vendidos</div>
          <div className="report-value">{stats.totalItems} kg</div>
        </div>
        <div className="card report-card">
          <div className="report-label">Item Mais Vendido</div>
          <div className="report-value">{stats.bestSeller?.name || 'Nenhum'}</div>
          <div className="report-sub">{stats.bestSeller ? `${stats.bestSeller.quantity} kg vendidos` : '-'}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="table">
          <div className="table-head" style={{ gridTemplateColumns: '2fr 1fr 1.2fr' }}>
            <div className="th">Produto</div>
            <div className="th">Qtd. Vendida</div>
            <div className="th">Receita Gerada</div>
          </div>
          {stats.productSales.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#8a93a3' }}>
              Nenhuma venda concluída para gerar relatório.
            </div>
          ) : (
            stats.productSales.map((p) => (
              <div className="table-row" key={p.name} style={{ gridTemplateColumns: '2fr 1fr 1.2fr' }}>
                <div className="td">
                  <div className="td-title">{p.name}</div>
                </div>
                <div className="td">{p.quantity} kg</div>
                <div className="td">{formatCurrency(p.revenue)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
