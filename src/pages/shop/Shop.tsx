import { useState, useMemo, useEffect } from 'react'
import '../../assets/styles/Shop.css'
import type { Order, OrderItem } from '../../types'
import { paymentService } from '../../services/payment.service'
import { storageService } from '../../services/storage.service'
import { useProducts } from '../../hooks/admin/useProducts'
import { formatCurrency, formatPhone, formatCep } from '../../utils/formatters'

export default function Shop() {
  const { products, setProducts } = useProducts()
  const [cart, setCart] = useState<OrderItem[]>([])
  const [checkoutModal, setCheckoutModal] = useState(false)
  const [clientInfo, setClientInfo] = useState({ 
    name: '', 
    phone: '', 
    cep: '', 
    address: '', 
    number: '', 
    payment: 'Pix',
    email: '',
    taxId: ''
  })
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [loadingCep, setLoadingCep] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Extrair categorias únicas dos produtos
  const categories = useMemo(() => {
    const cats = products.map(p => p.category)
    return ['Todas', ...Array.from(new Set(cats))]
  }, [products])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Todas') return products
    return products.filter(p => p.category === selectedCategory)
  }, [products, selectedCategory])

  // Sincronizar produtos se houver mudanças no localStorage (opcional, para refletir mudanças do painel sem reload)
  useEffect(() => {
    const handleStorage = () => {
      const stored = storageService.getProducts()
      if (stored.length > 0) setProducts(stored)
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [setProducts])

  const addToCart = (product: any) => {
    const qty = quantities[product.name] || 1
    const existing = cart.find(item => item.productName === product.name)
    if (existing) {
      setCart(cart.map(item => 
        item.productName === product.name 
          ? { ...item, quantity: item.quantity + qty } 
          : item
      ))
    } else {
      setCart([...cart, { 
        productName: product.name, 
        quantity: qty, 
        price: product.promoPrice || product.price 
      }])
    }
    // Reset quantity after adding
    setQuantities({ ...quantities, [product.name]: 1 })
  }

  const updateQuantity = (productName: string, delta: number) => {
    const current = quantities[productName] || 1
    const next = Math.max(1, current + delta)
    setQuantities({ ...quantities, [productName]: next })
  }

  const removeFromCart = (productName: string) => {
    setCart(cart.filter(item => item.productName !== productName))
  }

  const cartTotal = useMemo(() => 
    cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), 
  [cart])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0 || !clientInfo.name || !clientInfo.phone || !clientInfo.address || !clientInfo.number) return

    setIsProcessing(true)
    try {
      const storedOrders = storageService.getOrders()
      const orderId = storedOrders.length > 0 ? Math.max(...storedOrders.map(o => o.id)) + 1 : 1
      
      // Se for Abacate Pay, gera a cobrança online
      if (clientInfo.payment === 'AbacatePay') {
        const response = await paymentService.createBilling({
          frequency: 'ONE_TIME',
          methods: ['PIX', 'CARD'],
          products: cart.map(item => ({
            externalId: item.productName,
            name: item.productName,
            quantity: item.quantity,
            unitPrice: Math.round(item.price * 100) // em centavos
          })),
          returnUrl: window.location.href,
          completionUrl: window.location.href,
          customer: {
            name: clientInfo.name,
            cellphone: clientInfo.phone,
            email: clientInfo.email,
            taxId: clientInfo.taxId
          }
        })

        if (response.data?.url) {
          // Criar o pedido como "Pendente" antes de redirecionar
          const newOrder: Order = {
            id: orderId,
            clientName: clientInfo.name,
            clientPhone: `${clientInfo.phone} | End: ${clientInfo.address}, nº ${clientInfo.number}${clientInfo.cep ? ` (CEP: ${clientInfo.cep})` : ''}`,
            date: Date.now(),
            createdAt: Date.now(),
            total: cartTotal,
            payment: 'AbacatePay',
            status: 'Pendente',
            items: cart
          }
          storageService.setOrders([newOrder, ...storedOrders])
          
          // Redirecionar para o checkout do Abacate Pay
          window.location.href = response.data.url
          return
        }
      }

      // Fluxo normal (Manual)
      const newOrder: Order = {
        id: orderId,
        clientName: clientInfo.name,
        clientPhone: `${clientInfo.phone} | End: ${clientInfo.address}, nº ${clientInfo.number}${clientInfo.cep ? ` (CEP: ${clientInfo.cep})` : ''}`,
        date: Date.now(),
        createdAt: Date.now(),
        total: cartTotal,
        payment: clientInfo.payment as any,
        status: 'Pendente',
        items: cart
      }

      storageService.setOrders([newOrder, ...storedOrders])
      
      setOrderSuccess(true)
      setCart([])
      setCheckoutModal(false)
      setClientInfo({ name: '', phone: '', cep: '', address: '', number: '', payment: 'Pix', email: '', taxId: '' })

      setTimeout(() => setOrderSuccess(false), 5000)
    } catch (err) {
      console.error('Erro ao processar pedido:', err)
      alert('Houve um erro ao processar seu pedido. Por favor, tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    const formattedCep = formatCep(cleanCep)
    setClientInfo({ ...clientInfo, cep: formattedCep })

    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setClientInfo(prev => ({
            ...prev,
            cep: formattedCep,
            address: `${data.logradouro}, ${data.bairro}, ${data.localidade}-${data.uf}`
          }))
        } else {
          alert('CEP não encontrado.')
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err)
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const handlePhoneChange = (value: string) => {
    setClientInfo({ ...clientInfo, phone: formatPhone(value) })
  }

  return (
    <div className="shop-container">
      <header className="shop-header">
        <div className="shop-logo">
          <img src="/logo-mm-pescados.png" alt="MM Pescados" />
        </div>
        <div className="shop-cart-status" onClick={() => setCheckoutModal(true)}>
          <svg viewBox="0 0 24 24" className="cart-icon">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.27.12-.41 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          <span className="cart-count">{cart.length}</span>
        </div>
      </header>

      <main className="shop-content">
        <h1 className="shop-title">Nossos Produtos</h1>
        
        <div className="shop-filters">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="shop-grid">
          {filteredProducts.length === 0 ? (
            <p className="no-products">Nenhum produto disponível no momento.</p>
          ) : (
            filteredProducts.map(p => (
              <div key={p.name} className="shop-card">
                <div className="shop-card-img">
                  {p.image ? (
                    <img src={p.image} alt={p.name} />
                  ) : (
                    <div className="no-img-placeholder">🐟</div>
                  )}
                  {p.isPromo && p.promoPrice && p.promoPrice > 0 && (
                    <span className="promo-badge">Oferta</span>
                  )}
                </div>
                <div className="shop-card-info">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-category">{p.category}</p>
                  <div className="product-price">
                    {p.isPromo && p.promoPrice ? (
                      <>
                        <span className="old-price">R$ {p.price.toFixed(2)}</span>
                        <span className="current-price">R$ {p.promoPrice.toFixed(2)} /kg</span>
                      </>
                    ) : (
                      <span className="current-price">R$ {p.price.toFixed(2)} /kg</span>
                    )}
                  </div>
                  <div className="qty-selector">
                    <button onClick={() => updateQuantity(p.name, -1)} disabled={p.stockKg <= 0}>-</button>
                    <span>{quantities[p.name] || 1}</span>
                    <button onClick={() => updateQuantity(p.name, 1)} disabled={p.stockKg <= 0}>+</button>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(p)}
                    disabled={p.stockKg <= 0}
                  >
                    {p.stockKg <= 0 ? 'Sem estoque' : 'Adicionar ao Carrinho'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {orderSuccess && (
        <div className="success-toast">
          ✅ Pedido realizado com sucesso! Aguarde nosso contato.
        </div>
      )}

      {checkoutModal && (
        <div className="shop-modal">
          <div className="shop-modal-content">
            <h2>Seu Carrinho</h2>
            <div className="cart-items">
              {cart.length === 0 ? (
                <p>Seu carrinho está vazio.</p>
              ) : (
                cart.map(item => (
                  <div key={item.productName} className="cart-item">
                    <div className="cart-item-info">
                      <span>{item.productName} (x{item.quantity})</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.productName)} className="remove-btn">×</button>
                  </div>
                ))
              )}
            </div>
            
            {cart.length > 0 && (
              <>
                <div className="cart-total">
                  <strong>Total: R$ {cartTotal.toFixed(2)}</strong>
                </div>
                <form className="checkout-form" onSubmit={handleCheckout}>
                  <h3>Dados para entrega</h3>
                  <input 
                    placeholder="Seu Nome" 
                    value={clientInfo.name}
                    onChange={e => setClientInfo({...clientInfo, name: e.target.value})}
                    required 
                  />
                  <input 
                    placeholder="Seu Telefone" 
                    value={clientInfo.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    required 
                    maxLength={15}
                  />
                  <div className="cep-input-group">
                    <input 
                      placeholder="CEP" 
                      value={clientInfo.cep}
                      onChange={e => handleCepChange(e.target.value)}
                      maxLength={9}
                    />
                    {loadingCep && <span className="cep-loading">Buscando...</span>}
                  </div>
                  <input 
                    placeholder="Endereço de Entrega (Rua, Bairro)" 
                    value={clientInfo.address}
                    onChange={e => setClientInfo({...clientInfo, address: e.target.value})}
                    required 
                  />
                  <input 
                    placeholder="Número" 
                    value={clientInfo.number}
                    onChange={e => setClientInfo({...clientInfo, number: e.target.value})}
                    required 
                  />
                  
                  <div className="payment-select">
                    <label>Forma de Pagamento:</label>
                    <select 
                      value={clientInfo.payment}
                      onChange={e => setClientInfo({...clientInfo, payment: e.target.value})}
                    >
                      <option value="Pix">Pix (na entrega)</option>
                      <option value="Cartão">Cartão (na entrega)</option>
                      <option value="Dinheiro">Dinheiro (na entrega)</option>
                      <option value="AbacatePay">Pagamento Online (Abacate Pay)</option>
                    </select>
                  </div>

                  {clientInfo.payment === 'AbacatePay' && (
                    <div className="abacate-fields">
                      <p className="abacate-info">Para pagamento online, precisamos de mais alguns dados:</p>
                      <input 
                        placeholder="Seu E-mail" 
                        type="email"
                        value={clientInfo.email}
                        onChange={e => setClientInfo({...clientInfo, email: e.target.value})}
                        required 
                      />
                      <input 
                        placeholder="Seu CPF (apenas números)" 
                        value={clientInfo.taxId}
                        onChange={e => setClientInfo({...clientInfo, taxId: e.target.value.replace(/\D/g, '')})}
                        required 
                        maxLength={11}
                      />
                    </div>
                  )}

                  <button type="submit" className="confirm-btn" disabled={isProcessing}>
                    {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
                  </button>
                </form>
              </>
            )}
            <button onClick={() => setCheckoutModal(false)} className="close-modal-btn">Continuar Comprando</button>
          </div>
        </div>
      )}
    </div>
  )
}
