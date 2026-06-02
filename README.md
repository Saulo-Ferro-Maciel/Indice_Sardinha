# Índice Sardinha

**Calculadora de Paridade de Poder de Compra (PPC) baseada no preço da sardinha enlatada.**

Criado por **Saulo Ferro Maciel** · Maio de 2026 · São Luís — Maranhão

---

## Estrutura do Projeto

```
indice-sardinha/
├── index.html          ← página principal
└── src/
    ├── css/
    │   └── styles.css  ← estilos completos (responsivo)
    ├── js/
    │   └── main.js     ← lógica de cálculo (anti-XSS)
    └── img/            ← pasta reservada para imagens
```

## Como usar

Basta abrir `index.html` em qualquer navegador moderno. Não requer servidor nem dependências externas além das fontes do Google Fonts (carregadas via CDN).

## Metodologia

A **USL (Unidade de Sardinha em Lata)** é a unidade de medida do índice:

```
Paridade (USL)      = Valor do Produto ÷ Preço da Lata
Sobra Diária (USL)  = (⌈USL⌉ × Preço_Lata − Custo_Transporte) ÷ Preço_Lata
Dias p/ 1 USL extra = Preço_Lata ÷ Sobra_Diária_em_Reais
```

**Cenário âncora (São Luís — MA):**
- Lata de sardinha: R$ 5,00
- Passagem ida e volta: R$ 8,40 → 1,68 USL/dia
- Sobra diária: R$ 1,60 → 0,32 USL
- **3 dias de trabalho** para acumular 1 sardinha fora do orçamento

## Segurança

Todo input do usuário é validado via `parseFloat()` e renderizado exclusivamente com `textContent` — sem `innerHTML` com variáveis, protegendo contra XSS e HTML Injection.

## Licença

Livre para uso educacional e acadêmico com atribuição ao autor.
