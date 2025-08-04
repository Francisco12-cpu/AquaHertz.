# 🌊 AquaHertz - Simulador de Poluição Sonora Marinha

Simulador educacional interativo completamente funcional que demonstra os efeitos da poluição sonora nos ecossistemas marinhos através de simulação realística em tempo real.

## ✨ Funcionalidades Principais

- **Oceano 2D Animado**: Ambiente marinho com 30-100 animais renderizados via Canvas
- **Comportamentos Realistas**: Peixes em cardumes, golfinhos, baleias e tartarugas com movimentos únicos  
- **Sistema de Estresse**: 4 níveis visuais com reações comportamentais aos sons
- **Propagação Sonora**: Ondas circulares com atenuação por distância
- **Monitoramento Real**: Dashboard com métricas ambientais em tempo real
- **Modos Manual/Automático**: Controle direto ou eventos aleatórios automáticos
- **Design Responsivo**: Funciona perfeitamente em mobile e desktop

## 🚀 Como Usar

1. **Configurar**: Escolha quantidade de animais (30-100) e modo de simulação
2. **Iniciar**: Clique em "Iniciar Simulação" para ativar o oceano
3. **Modo Manual**: Selecione fonte de ruído e clique no oceano para posicionar
4. **Modo Automático**: Sons surgem automaticamente em intervalos aleatórios
5. **Observar**: Monitore como os animais reagem e as métricas ambientais

## 📊 Métricas Monitoradas

- **Nível de Ruído Médio**: Intensidade sonora atual em decibéis
- **Índice de Bem-estar**: Percentual de animais saudáveis (estresse < 30)
- **Estresse Crítico**: Percentual de animais em estado crítico (estresse > 80)
- **Animais Ativos**: Contador em tempo real

## 🔊 Fontes de Ruído

- **Navio Comercial**: 120-140 dB, alcance 200px, duração 15s
- **Sonar Militar**: 180-200 dB, alcance 300px, duração 8s  
- **Perfuração Submarina**: 150-170 dB, alcance 250px, duração 20s
- **Construção Marítima**: 140-160 dB, alcance 180px, duração 12s

## 🐟 Comportamentos dos Animais

### Peixes
- Nadam em cardumes com movimento em ziguezague
- Atraídos por outros peixes próximos (raio de 60px)
- Movimento errático quando estressados

### Golfinhos  
- Movem-se em arcos graciosos
- Nadam em círculos quando desorientados (estresse > 60)
- Velocidade moderada-alta

### Tartarugas
- Movimento lento e constante
- Mudanças bruscas de direção quando estressadas
- Velocidade baixa

### Baleias
- Movimentos em curvas amplas e elegantes
- Podem alterar "rotas de migração" sob estresse
- Maior tamanho e presença visual

## 🎨 Níveis de Estresse Visual

- **0-30 (Azul)**: Calmo - comportamento normal
- **31-60 (Amarelo)**: Assustado - movimento ligeiramente acelerado  
- **61-80 (Laranja)**: Estressado - movimento errático, velocidade aumentada
- **81-100 (Vermelho)**: Crítico - desorientação total, colisões

## 🛠️ Tecnologias

- **HTML5 Canvas**: Renderização 2D de alta performance
- **CSS3**: Tema neon oceânico com animações fluidas
- **JavaScript ES6+**: Física, comportamento animal e sistema de partículas
- **Font Awesome**: Ícones da interface
- **Google Fonts**: Tipografia Inter

## 📱 Instalação

1. Baixe os 4 arquivos: `index.html`, `style.css`, `script.js`, `README.md`
2. Coloque todos na mesma pasta
3. Abra `index.html` no navegador ou faça deploy no GitHub Pages

## 👨‍💻 Desenvolvedor

**Francisco Audir De Oliveira Filho**  
Instagram: [@filho.af](https://instagram.com/filho.af)

## 📄 Licença

Projeto educacional de código aberto para conscientização ambiental.

---

**🌊 Proteja nossos oceanos, preserve a vida marinha! 🐋**
