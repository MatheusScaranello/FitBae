import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle2, ChevronRight, Info, AlertCircle, Leaf, Plus } from 'lucide-react';

const App = () => {
  // --- DADOS DO CARDÁPIO (Baseados no PDF) ---
  const BASE_PRICE = 22.90;
  
  const menuData = {
    breads: [
      { id: 'p1', name: 'Pão branco macio' },
      { id: 'p2', name: 'Pão italiano' },
      { id: 'p3', name: 'Pão integral' },
      { id: 'p4', name: 'Pão 9 grãos' },
      { id: 'p5', name: 'Rap10 integral' },
      { id: 'p6', name: 'Rap10 low carb' },
      { id: 'p7', name: 'Pão de aveia' },
      { id: 'p8', name: 'Pão sem glúten (premium)' },
      { id: 'p9', name: 'Tapioca prensada' },
    ],
    proteins: [
      { id: 'pr1', name: 'Frango grelhado' },
      { id: 'pr2', name: 'Frango desfiado' },
      { id: 'pr3', name: 'Carne Moída' },
      { id: 'pr4', name: 'Atum cremoso leve' },
      { id: 'pr5', name: 'Falafel' },
    ],
    salads: [
      { id: 's1', name: 'Alface americana' },
      { id: 's2', name: 'Rúcula' },
      { id: 's3', name: 'Tomate' },
      { id: 's4', name: 'Pepino' },
      { id: 's5', name: 'Cebola roxa' },
      { id: 's6', name: 'Milho' },
      { id: 's7', name: 'Azeitona' },
      { id: 's8', name: 'Picles' },
    ],
    sauces: [
      { id: 'm1', name: 'Mostarda e mel' },
      { id: 'm2', name: 'Barbecue' },
      { id: 'm3', name: 'Caesar leve' },
    ],
    cheeses: [
      { id: 'q1', name: 'Queijo prato', price: 4.00 },
      { id: 'q2', name: 'Muçarela', price: 4.00 },
    ],
    premium: [
      { id: 'ex1', name: 'Ovo cozido', price: 3.00 },
      { id: 'ex2', name: 'Ricota', price: 3.00 },
    ]
  };

  // --- ESTADOS DO CARRINHO (Vários lanches) ---
  const [cart, setCart] = useState([]);

  // --- ESTADOS DO LANCHE ATUAL ---
  const [selectedBread, setSelectedBread] = useState(null);
  const [selectedProtein, setSelectedProtein] = useState(null);
  const [selectedSalads, setSelectedSalads] = useState([]);
  const [selectedSauce, setSelectedSauce] = useState(null);
  
  // Upsells
  const [selectedCheese, setSelectedCheese] = useState(null); // Max 1 permitido
  const [extraProteins, setExtraProteins] = useState([]);
  const [extraSauces, setExtraSauces] = useState([]);
  const [selectedPremium, setSelectedPremium] = useState([]);

  const [currentTotal, setCurrentTotal] = useState(BASE_PRICE);
  const [errorMsg, setErrorMsg] = useState("");

  // --- CÁLCULO DO TOTAL DO LANCHE ATUAL ---
  useEffect(() => {
    let newTotal = BASE_PRICE;
    if (selectedCheese) newTotal += 4.00;
    newTotal += extraProteins.length * 7.00; // R$ 7 cada proteina extra
    newTotal += extraSauces.length * 2.00;   // R$ 2 cada molho extra (valor estimado)
    newTotal += selectedPremium.length * 3.00; // R$ 3 cada extra premium
    setCurrentTotal(newTotal);
  }, [selectedCheese, extraProteins, extraSauces, selectedPremium]);

  // --- FUNÇÕES AUXILIARES ---
  const toggleArrayItem = (item, array, setArray) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
    setErrorMsg("");
  };

  const handleCheeseSelect = (cheeseName) => {
    // Permite apenas 1 queijo. Se clicar no mesmo, desmarca. Se clicar em outro, substitui.
    if (selectedCheese === cheeseName) {
      setSelectedCheese(null);
    } else {
      setSelectedCheese(cheeseName);
    }
  };

  const resetCurrentSandwich = () => {
    setSelectedBread(null);
    setSelectedProtein(null);
    setSelectedSalads([]);
    setSelectedSauce(null);
    setSelectedCheese(null);
    setExtraProteins([]);
    setExtraSauces([]);
    setSelectedPremium([]);
    setCurrentTotal(BASE_PRICE);
  };

  // --- ADICIONAR OUTRO LANCHE AO CARRINHO ---
  const handleAddAnother = () => {
    if (!selectedBread || !selectedProtein || !selectedSauce) {
      setErrorMsg("Termine de montar este lanche (escolha pão, proteína e molho) antes de adicionar outro.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sandwich = {
      bread: selectedBread,
      protein: selectedProtein,
      salads: selectedSalads,
      sauce: selectedSauce,
      cheese: selectedCheese,
      extraProteins: extraProteins,
      extraSauces: extraSauces,
      premium: selectedPremium,
      total: currentTotal
    };

    setCart([...cart, sandwich]);
    resetCurrentSandwich();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- FINALIZAR PEDIDO (WHATSAPP) ---
  const handleFinishOrder = () => {
    let finalCart = [...cart];
    
    // Se o lanche atual estiver parcialmente preenchido, mas válido, inclui ele no carrinho antes de fechar
    if (selectedBread && selectedProtein && selectedSauce) {
      finalCart.push({
        bread: selectedBread,
        protein: selectedProtein,
        salads: selectedSalads,
        sauce: selectedSauce,
        cheese: selectedCheese,
        extraProteins: extraProteins,
        extraSauces: extraSauces,
        premium: selectedPremium,
        total: currentTotal
      });
    } else if (finalCart.length === 0) {
      // Se não tem nada no carrinho e o lanche atual não está completo
      setErrorMsg("Por favor, escolha pelo menos 1 pão, 1 proteína e 1 molho para montar seu lanche.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let message = "Meu pedido\n\n";
    let grandTotal = 0;

    finalCart.forEach((item, index) => {
      if (finalCart.length > 1) {
        message += `*Lanche ${index + 1}:*\n`;
      }
      message += `--${item.bread}--\n`;
      message += `--${item.protein}--\n`;
      item.salads.forEach(s => message += `--${s}--\n`);
      message += `--${item.sauce}--\n`;
      
      if (item.cheese) message += `--Queijo ${item.cheese}--\n`;
      item.extraProteins.forEach(p => message += `--Extra: ${p}--\n`);
      item.extraSauces.forEach(m => message += `--Extra: ${m}--\n`);
      item.premium.forEach(p => message += `--Extra: ${p}--\n`);
      
      if (finalCart.length > 1) {
        message += `_Subtotal: R$ ${item.total.toFixed(2).replace('.', ',')}_\n\n`;
      }
      grandTotal += item.total;
    });

    message += `\n*Total a Pagar:* R$ ${grandTotal.toFixed(2).replace('.', ',')}`;

    const phoneNumber = "5519997577263";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  // Calcula o total geral exibido no botão
  const totalGeral = cart.reduce((acc, item) => acc + item.total, 0) + (selectedBread || selectedProtein || selectedSauce || selectedSalads.length > 0 ? currentTotal : 0);

  return (
    <div className="min-h-screen bg-orange-50 font-sans pb-32 text-gray-800">
      {/* HEADER */}
      <header className="bg-[#135c30] text-white p-6 rounded-b-3xl shadow-lg sticky top-0 z-10">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="bg-white px-6 py-2 rounded-full mb-3 shadow-md flex items-center gap-2">
            <Leaf className="text-[#135c30]" size={24} />
            <h1 className="text-3xl font-extrabold tracking-tight text-[#135c30]">
              fit<span className="text-[#fcb913]">baê</span>
            </h1>
          </div>
          <p className="text-sm font-medium opacity-90 text-center">Sua escolha saudável, rápida e deliciosa!</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6 mt-4">
        
        {/* INDICADOR DE CARRINHO */}
        {cart.length > 0 && (
          <div className="bg-green-100 text-green-800 p-3 rounded-xl flex items-center justify-between border border-green-200">
            <span className="font-bold flex items-center gap-2">
              <ShoppingBag size={18} />
              {cart.length} {cart.length === 1 ? 'lanche adicionado' : 'lanches adicionados'}
            </span>
            <span className="text-sm font-semibold">R$ {cart.reduce((acc, item) => acc + item.total, 0).toFixed(2).replace('.',',')}</span>
          </div>
        )}

        {/* SOBRE O FITBAÊ */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-2 text-[#135c30]">
            <Info size={20} />
            <h2 className="font-bold text-lg">O que é o Fitbaê?</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            O <strong>Fitbaê</strong> é a sua nova forma de comer bem sem abrir mão do sabor. 
            Você monta o seu sanduíche ideal, escolhendo bases nutritivas, proteínas e saladas à vontade.
          </p>
          <div className="mt-3 inline-block bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-semibold">
            Lanche Base: R$ 22,90
          </div>
        </section>

        {/* MENSAGEM DE ERRO */}
        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-200 animate-pulse">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 className="text-center py-2 text-gray-400 text-sm font-bold uppercase tracking-wider">
              {cart.length > 0 ? `Montando o ${cart.length + 1}º Lanche` : "Monte seu Lanche"}
            </h2>
        </div>

        {/* PASSO 1: PÃO */}
        <section>
          <div className="mb-3">
            <h3 className="font-bold text-xl text-[#135c30] flex items-center gap-2">
              <span className="bg-[#fcb913] text-[#135c30] w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Escolha a Base
            </h3>
            <p className="text-xs text-gray-500">Escolha 1 opção</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {menuData.breads.map((bread) => (
              <button
                key={bread.id}
                onClick={() => { setSelectedBread(bread.name); setErrorMsg(""); }}
                className={`p-3 rounded-xl text-sm font-medium text-left transition-all border ${
                  selectedBread === bread.name 
                    ? 'bg-[#135c30] text-white border-[#135c30] shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#135c30]'
                }`}
              >
                {bread.name}
              </button>
            ))}
          </div>
        </section>

        {/* PASSO 2: PROTEÍNA */}
        <section>
          <div className="mb-3">
            <h3 className="font-bold text-xl text-[#135c30] flex items-center gap-2">
              <span className="bg-[#fcb913] text-[#135c30] w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Escolha a Proteína Principal
            </h3>
            <p className="text-xs text-gray-500">Escolha 1 opção (Já inclusa)</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {menuData.proteins.map((protein) => (
              <button
                key={protein.id}
                onClick={() => { setSelectedProtein(protein.name); setErrorMsg(""); }}
                className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all border ${
                  selectedProtein === protein.name 
                    ? 'bg-[#135c30] text-white border-[#135c30] shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#135c30]'
                }`}
              >
                {protein.name}
                {selectedProtein === protein.name && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </section>

        {/* PASSO 3: SALADAS */}
        <section>
          <div className="mb-3">
            <h3 className="font-bold text-xl text-[#135c30] flex items-center gap-2">
              <span className="bg-[#fcb913] text-[#135c30] w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Saladas e Complementos
            </h3>
            <p className="text-xs text-green-600 font-semibold bg-green-100 inline-block px-2 py-0.5 rounded-md mt-1">À Vontade (Livres)</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {menuData.salads.map((salad) => {
              const isSelected = selectedSalads.includes(salad.name);
              return (
                <button
                  key={salad.id}
                  onClick={() => toggleArrayItem(salad.name, selectedSalads, setSelectedSalads)}
                  className={`p-3 rounded-xl text-sm font-medium flex justify-start items-center gap-2 transition-all border ${
                    isSelected 
                      ? 'bg-green-50 border-green-500 text-green-800' 
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {isSelected && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  {salad.name}
                </button>
              )
            })}
          </div>
        </section>

        {/* PASSO 4: MOLHO PRINCIPAL */}
        <section>
          <div className="mb-3">
            <h3 className="font-bold text-xl text-[#135c30] flex items-center gap-2">
              <span className="bg-[#fcb913] text-[#135c30] w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
              Escolha o Molho Principal
            </h3>
            <p className="text-xs text-gray-500">Escolha 1 opção (Já incluso)</p>
          </div>
          <div className="flex flex-col gap-2">
            {menuData.sauces.map((sauce) => (
              <button
                key={sauce.id}
                onClick={() => { setSelectedSauce(sauce.name); setErrorMsg(""); }}
                className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all border ${
                  selectedSauce === sauce.name 
                    ? 'bg-[#135c30] text-white border-[#135c30] shadow-md' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#135c30]'
                }`}
              >
                {sauce.name}
                {selectedSauce === sauce.name && <CheckCircle2 size={16} />}
              </button>
            ))}
          </div>
        </section>

        {/* PASSO 5: UPSELLS & EXTRAS */}
        <section className="bg-[#135c30]/5 p-4 rounded-2xl border border-[#135c30]/10">
          <div className="mb-4">
            <h3 className="font-bold text-xl text-[#135c30]">Turbine seu Lanche</h3>
            <p className="text-xs text-gray-600">Adicionais pagos</p>
          </div>

          <div className="space-y-6">
            {/* Queijos (Apenas 1) */}
            <div>
              <div className="flex justify-between items-end mb-2 border-b border-gray-200 pb-1">
                <h4 className="text-sm font-bold text-gray-700">Queijo (+ R$ 4,00)</h4>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Máx 1</span>
              </div>
              <div className="flex flex-col gap-2">
                {menuData.cheeses.map(cheese => {
                  const isSelected = selectedCheese === cheese.name;
                  return (
                    <button
                      key={cheese.id}
                      onClick={() => handleCheeseSelect(cheese.name)}
                      className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all border bg-white ${
                        isSelected ? 'border-[#fcb913] ring-1 ring-[#fcb913]' : 'border-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {/* Radio icon simulate */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-[#fcb913] border-[#fcb913]' : 'border-gray-300'}`}>
                           {isSelected && <div className="w-1.5 h-1.5 bg-[#135c30] rounded-full"></div>}
                        </div>
                        {cheese.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Proteína Extra */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Proteína Extra (+ R$ 7,00)</h4>
              <div className="flex flex-col gap-2">
                {menuData.proteins.map(protein => {
                  const isSelected = extraProteins.includes(protein.name);
                  return (
                    <button
                      key={`extra-${protein.id}`}
                      onClick={() => toggleArrayItem(protein.name, extraProteins, setExtraProteins)}
                      className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all border bg-white ${
                        isSelected ? 'border-[#fcb913] ring-1 ring-[#fcb913]' : 'border-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-[#fcb913] border-[#fcb913]' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 size={12} className="text-[#135c30]" />}
                        </div>
                        {protein.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Molho Extra */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Molho Extra (+ R$ 2,00)</h4>
              <div className="flex flex-col gap-2">
                {menuData.sauces.map(sauce => {
                  const isSelected = extraSauces.includes(sauce.name);
                  return (
                    <button
                      key={`extra-${sauce.id}`}
                      onClick={() => toggleArrayItem(sauce.name, extraSauces, setExtraSauces)}
                      className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all border bg-white ${
                        isSelected ? 'border-[#fcb913] ring-1 ring-[#fcb913]' : 'border-gray-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-[#fcb913] border-[#fcb913]' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 size={12} className="text-[#135c30]" />}
                        </div>
                        {sauce.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Extras Premium */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2 border-b border-gray-200 pb-1">Extras Premium (+ R$ 3,00)</h4>
              <div className="flex flex-col gap-2">
                {menuData.premium.map(item => {
                  const isSelected = selectedPremium.includes(item.name);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleArrayItem(item.name, selectedPremium, setSelectedPremium)}
                      className={`p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all border bg-white ${
                        isSelected ? 'border-[#fcb913] ring-1 ring-[#fcb913]' : 'border-gray-200'
                      }`}
                    >
                       <span className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-[#fcb913] border-[#fcb913]' : 'border-gray-300'}`}>
                          {isSelected && <CheckCircle2 size={12} className="text-[#135c30]" />}
                        </div>
                        {item.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER FIXO - AÇÕES DO PEDIDO */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] p-4 z-50 rounded-t-3xl">
        <div className="max-w-md mx-auto space-y-3">
          
          <div className="flex justify-between items-center text-sm px-1">
            <span className="text-gray-500 font-medium">Subtotal deste lanche:</span>
            <span className="font-bold text-gray-700">R$ {currentTotal.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="flex gap-2">
            {/* Botão Adicionar Outro */}
            <button 
              onClick={handleAddAnother}
              className="flex-1 bg-green-50 border border-[#135c30] text-[#135c30] py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Adicionar</span> Outro
            </button>

            {/* Botão Finalizar */}
            <button 
              onClick={handleFinishOrder}
              className="flex-[2] bg-[#fcb913] hover:bg-yellow-500 text-[#135c30] py-3 px-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
            >
              <ShoppingBag size={20} />
              Finalizar (R$ {totalGeral.toFixed(2).replace('.', ',')})
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;
